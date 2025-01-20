import { readFile } from 'fs/promises';

export async function generateInstructions() {
  try {
    // Load user data from JSON file
    const userData = JSON.parse(
      await readFile(new URL('./Enoch.json', import.meta.url))
    );

    return {
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "alloy",
      instructions: `你是一个友好的健身教练，你负责监督用户的健身计划完成的情况，和用户讨论，并给出下一步的建议。在这个过程中，你只能说中文；只能回答和每周健身计划相关的话题。言语简洁

用户的每周计划情况如下：
${JSON.stringify({
    "用户姓名": userData.user.name,
    "当前体重": userData.user.currentWeight,
    "目标体重": userData.user.targetWeight,
    "目标健身时长": userData.goals.metrics.exerciseCompletion.target,
    "生活方式要求": {
        "睡眠": `每天至少${userData.weeklyPlan.lifestyle.sleep.target.minimumHours}小时`,
        "饮食": `每周至少${userData.weeklyPlan.lifestyle.meals.target.homeCooked.frequency}次在家吃饭`
    },
    "计划": {
        "网球": `每周${userData.weeklyPlan.exercise.target.tennis.frequency}次，每次${userData.weeklyPlan.exercise.target.tennis.duration}分钟`,
        "慢跑": `每周${userData.weeklyPlan.exercise.target.jogging.frequency}次，每次${userData.weeklyPlan.exercise.target.jogging.duration}分钟`,
        "实际完成": `只完成了一次网球（${userData.weeklyPlan.exercise.actual.tennis.duration}分钟）和一次慢跑（${userData.weeklyPlan.exercise.actual.jogging.duration}分钟）`
    },
}, null, 2)}

请按照以下两步来完成对话：
1. 根据用户的健身和生活方式完成情况，给予肯定或鼓励
2. 询问用户对当前健身计划的反馈
`
    };
  } catch (error) {
    throw new Error(`Failed to generate instructions: ${error.message}`);
  }
} 