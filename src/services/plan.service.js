import httpStatus from 'http-status';
import config from '../config/config.js';
import { tokenServices, userServices } from './index.js';
import { prisma } from '../../prisma/client.js';
import { ApiError } from '../utils/ApiError.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Groq } from 'groq-sdk';
import axios from 'axios';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const geminiApiRequest = async (dataPlans) => {
  try {
    const genAI = new GoogleGenerativeAI(config.gemini.key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = promptText(dataPlans);

    const result = await model.generateContent(prompt);

    let res;
    try {
      const rawText = await result.response.text();
      res = JSON.parse(rawText);
      console.log('result AI: ', res.result);
    } catch (err) {
      console.error('Raw response:', await result.response.text()); // log untuk debug
      throw new ApiError(httpStatus.BAD_REQUEST, 'Response AI is not valid JSON.');
    }

    return res.result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error?.message || 'Failed to summon AI');
  }
};

const grokApiRequest = async (dataPlans) => {
  const groq = new Groq({
    apiKey: config.groq.key
  });
  const prompt = promptText(dataPlans);

  const result = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'meta-llama/llama-4-scout-17b-16e-instruct'
  });
  let res;
  try {
    res = JSON.parse(result.choices[0]?.message?.content || '');
    console.log('result AI: ', res.result);
    return res.result;
  } catch (error) {
    console.error('Raw response:', res.result); // log untuk debug
    throw new ApiError(httpStatus.BAD_REQUEST, 'Response AI is not valid JSON.');
  }
};

const youtubeApiRequest = async (exerciseName) => {
  try {
    const response = await axios.get(YOUTUBE_SEARCH_URL, {
      params: {
        key: config.youtube.key,
        q: `${exerciseName} exercise tutorial`,
        part: 'snippet',
        type: 'video',
        maxResults: 1,
        videoCategoryId: 17, // Sports category
        relevanceLanguage: 'id'
      }
    });
    if (response.data.items && response.data.items.length > 0) {
      const video = response.data.items[0];
      // pastikan judul video relevan
      if (video.snippet.title.toLowerCase().includes(exerciseName.toLowerCase())) {
        return `https://www.youtube.com/watch?v=${video.id.videoId}`;
      }
    }
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}`;
  } catch (error) {
    console.error(`Error fetching YouTube video for ${exerciseName}:`, error);
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}`;
  }
};

const createPlans = async (goalId) => {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { user: true }
  });
  if (!goal) throw new ApiError(httpStatus.NOT_FOUND, 'Your Goal is not found!');

  const dataPlans = {
    day: goal.availableDays,
    gender: goal.user.gender,
    age: goal.user.age,
    height: goal.user.heightCm,
    weight: goal.user.weightKg,
    goalType: goal.goalType,
    level: goal.experienceLevel,
    place: goal.equipment,
    notes: goal.goalNotes
  };

  let aiResponse = await geminiApiRequest(dataPlans);
  if (!aiResponse) aiResponse = await grokApiRequest(dataPlans);

  const planName = `Workout Plan for ${goal.goalType}`;
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      userId: goal.userId,
      goalId: goal.id,
      planName,
      totalWeeks: aiResponse.totalWeeks || 2
    }
  });

  // 2. Loop per hari (day1, day2, ...)
  const workoutDays = [];
  for (const [dayKey, exercises] of Object.entries(aiResponse)) {
    const dayNumber = parseInt(dayKey.replace('day', '')) || 1;

    const focusArea = exercises[0]?.kategori || 'full body';

    const workoutDay = await prisma.workoutDay.create({
      data: {
        planId: workoutPlan.id,
        dayNumber,
        focusArea,
        description: exercises[0]?.deskripsi || 'Latihan untuk seluruh tubuh'
      }
    });

    const exercisesWithSource = await Promise.all(
      exercises.map(async (ex) => {
        // Cek apakah Exercise sudah ada
        let exercise = await prisma.exercise.findFirst({
          where: { name: ex.nama_latihan.trim() }
        });

        // Dapatkan URL YouTube
        const youtubeSource = await youtubeApiRequest(ex.nama_latihan);

        // Jika tidak ada, buat Exercise baru
        if (!exercise) {
          exercise = await prisma.exercise.create({
            data: {
              name: ex.nama_latihan.trim(),
              category: ex.kategori || 'Unknown',
              equipment: ex.peralatan || 'Unknown',
              difficulty: ex.tingkat_kesulitan || 'Unknown',
              instructions: ex.instruksi || '',
              source: youtubeSource
            }
          });
        } else if (!exercise.source || !exercise.source.includes('youtube.com/watch')) {
          // Update source jika kosong atau tidak valid
          await prisma.exercise.update({
            where: { id: exercise.id },
            data: { source: youtubeSource }
          });
        }

        await prisma.workoutExercise.create({
          data: {
            workoutDayId: workoutDay.id,
            exerciseId: exercise.id,
            sets: ex.set || 3,
            reps: ex.repetisi || 10,
            restSeconds: ex.istirahat || 60,
            orderIndex: exercises.indexOf(ex)
          }
        });

        return {
          ...ex,
          source: youtubeSource
        };
      })
    );

    workoutDays.push({
      id: workoutDay.id,
      dayNumber,
      focusArea,
      description: workoutDay.description,
      exercises: exercisesWithSource
    });
  }

  // 5. Kembalikan respons
  return {
    dataPlan: {
      id: workoutPlan.id,
      planName: workoutPlan.planName,
      totalWeeks: workoutPlan.totalWeeks,
      createdAt: workoutPlan.createdAt,
      workoutDays
    }
  };
};

const promptText = (dataPlans) => {
  return `Buatkan rencana workout selama ${dataPlans.day} hari per minggu untuk ${dataPlans.gender === 'male' ? 'pria' : 'wanita'} usia ${dataPlans.age} tahun, tinggi ${dataPlans.height}cm, berat ${dataPlans.weight}kg. Tujuan saya adalah ${dataPlans.goalType}, saya termasuk level ${dataPlans.level} dan catatan tujuan ${dataPlans.notes}  . Saya hanya bisa latihan di ${dataPlans.place}.
  Buatkan satu hari maksimal 5 latihan
  kirim dengan format string seperti dibawah ini,  your entire response/output is going to consist of a single string object {}, and you will NOT wrap it within JSON md markers.

Format response:

{
  "result": {
    "day1": [
      {
        "nama_latihan": "String", nama latihan yang sesuai
        "kategori": "String", dari latihan itu ini termasuk ke dalam kategori apa
        "peralatan": "String", dari latihan itu ini termasuk ke bodyweight atau gym
        "tingkat_kesulitan": "String", dari latihan itu ini termasuk ke level beginner, intermediate, atau advanced
        "instruksi": "String", Berikan instruksi yang benar dari latihan itu
        "deskripsi": "String", berikan penjelasan apa manfaat dari latihan itu
        "set": number, Berikan saran berapa set untuk latihan itu
        "repetisi": number, Berikan saran berapa repistisi untuk latihan itu
        "istirahat": number, Berikan saran berapa lama istirahat dari setiap set atau repitisi
      },
      ...
    ],
    "day2": [...], dan seterusnya sampai day ${dataPlans.day}
    ...
  },
  "totalWeeks": number, perkiraan berapa minggu untuk berhasil mencapai tujuannya maximal 4 minggu
}

  kirim response dalam bahasa indonesia,
  Jangan menambahkan penjelasan atau teks lain di luar format yang diminta.`;
};

const deleteWorkoutPlan = async (planId) => {
  // 1. Periksa apakah WorkoutPlan ada
  const workoutPlan = await prisma.workoutPlan.findUnique({
    where: { id: planId }
  });

  if (!workoutPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, `WorkoutPlan dengan ID ${planId} tidak ditemukan`);
  }

  // 2. Ambil semua exerciseId terkait WorkoutPlan dalam transaksi
  // Menggunakan prisma.$transaction untuk memastikan semua operasi
  // (pengecekan dan penghapusan) dilakukan secara atomik.
  return await prisma.$transaction(async (tx) => {
    const workoutExercises = await tx.workoutExercise.findMany({
      where: {
        workoutDay: {
          planId
        }
      },
      select: { exerciseId: true }
    });

    // 3. Hapus WorkoutPlan (otomatis menghapus WorkoutDay & WorkoutExercise karena cascade)
    await tx.workoutPlan.delete({
      where: { id: planId }
    });

    // 4. Cek dan hapus Exercise yang tidak lagi digunakan
    for (const { exerciseId } of workoutExercises) {
      // Periksa apakah Exercise masih ada
      const exerciseExists = await tx.exercise.findUnique({
        where: { id: exerciseId }
      });

      if (exerciseExists) {
        // Periksa apakah Exercise masih digunakan oleh WorkoutExercise lain
        const count = await tx.workoutExercise.count({
          where: { exerciseId }
        });

        if (count === 0) {
          await tx.exercise.delete({
            where: { id: exerciseId }
          });
        }
      }
    }
  });
};

const getPlanById = async (planId) => {
  const getPlan = await prisma.workoutPlan.findUnique({
    where: { id: planId },
    include: {
      workoutDays: true
    }
  });

  if (!getPlan) throw new ApiError(httpStatus.NOT_FOUND, 'Plan is not found');
  return getPlan;
};

const getWorkoutExercisesByDay = async (workoutDayId) => {
  const getWorkoutExercises = await prisma.workoutExercise.findMany({
    where: { workoutDayId },
    include: {
      exercise: true
    },
    orderBy: {
      orderIndex: 'asc'
    }
  });

  if (!getWorkoutExercises || getWorkoutExercises.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Workout exercises not found');
  }
  return getWorkoutExercises;
};

export { createPlans, getPlanById, getWorkoutExercisesByDay, deleteWorkoutPlan };
