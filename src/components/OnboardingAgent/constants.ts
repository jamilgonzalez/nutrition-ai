import { Question } from './types'

export const QUESTIONS: Question[] = [
  {
    id: 'welcome',
    type: 'welcome',
    text: (name: string) =>
      `Hello ${
        name.split(' ')[0]
      }! I'm here to help create your personalized nutrition plan. Let's start by getting to know you better.`,
    voiceText: (name: string) =>
      `Hello ${
        name.split(' ')[0]
      }! I'm your nutrition AI assistant. I'm here to help create a personalized nutrition plan just for you. Let's start by getting to know you better.`,
  },
  {
    id: 'age',
    type: 'number',
    text: 'How old are you?',
    voiceText: 'How old are you?',
    field: 'age',
  },
  {
    id: 'sex',
    type: 'select',
    text: 'What is your biological sex?',
    voiceText:
      'What is your biological sex? You can say male, female, or other.',
    field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'height',
    type: 'number',
    text: 'What is your height in inches?',
    voiceText: 'What is your height in inches?',
    field: 'height',
  },
  {
    id: 'weight',
    type: 'number',
    text: 'What is your current weight in pounds?',
    voiceText: 'What is your current weight in pounds?',
    field: 'weight',
  },
  {
    id: 'activity',
    type: 'select',
    text: 'How would you describe your activity level?',
    voiceText:
      'How would you describe your activity level? You can say sedentary, light, moderate, active, or very active.',
    field: 'activityLevel',
    options: [
      { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
      { value: 'light', label: 'Light (1-3 days per week)' },
      { value: 'moderate', label: 'Moderate (3-5 days per week)' },
      { value: 'active', label: 'Active (6-7 days per week)' },
      { value: 'very_active', label: 'Very Active (twice per day)' },
    ],
  },
  {
    id: 'goals',
    type: 'text',
    text: 'What are your health and fitness goals?',
    voiceText:
      'What are your health and fitness goals? For example, weight loss, muscle gain, maintaining current weight, or improving overall health.',
    field: 'goals',
  },
  {
    id: 'health',
    type: 'text',
    text: 'Do you have any health conditions I should know about?',
    voiceText:
      'Do you have any health conditions I should know about? This could include diabetes, heart conditions, food allergies, or anything else relevant to your nutrition.',
    field: 'healthConditions',
  },
  {
    id: 'dietary',
    type: 'text',
    text: 'Do you have any dietary restrictions or preferences?',
    voiceText:
      'Do you have any dietary restrictions or preferences? For example, vegetarian, vegan, keto, gluten-free, or any foods you avoid.',
    field: 'dietaryRestrictions',
  },
]
