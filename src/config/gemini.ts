import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

// Khởi tạo Gemini AI
export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Lấy model Gemini 2.5 Flash (nhanh, rẻ, phù hợp tác vụ todo)
export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Interface cho Todo item
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  scheduledDate?: Date;
  scheduledTime?: string;
}

// Hàm AI để phân loại todo
export const categorizeTodo = async (text: string): Promise<string> => {
  try {
    const prompt = `
    Phân loại todo sau vào một trong các danh mục sau:
    - work (công việc)
    - personal (cá nhân)
    - shopping (mua sắm)
    - health (sức khỏe)
    - learning (học tập)
    - other (khác)
    
    Todo: "${text}"
    
    Chỉ trả về tên danh mục, không cần giải thích.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const category = response.text().trim().toLowerCase();
    
    // Kiểm tra xem category có hợp lệ không
    const validCategories = ['work', 'personal', 'shopping', 'health', 'learning', 'other'];
    return validCategories.includes(category) ? category : 'other';
  } catch (error) {
    console.error('Lỗi khi phân loại todo:', error);
    return 'other';
  }
};

// Hàm AI để xác định độ ưu tiên
export const getPriority = async (text: string): Promise<'low' | 'medium' | 'high'> => {
  try {
    const prompt = `
    Xác định độ ưu tiên của todo sau (low, medium, high):
    - high: việc khẩn cấp, quan trọng, có deadline gần
    - medium: việc quan trọng nhưng không khẩn cấp
    - low: việc ít quan trọng, có thể làm sau
    
    Todo: "${text}"
    
    Chỉ trả về: low, medium, hoặc high
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const priority = response.text().trim().toLowerCase();
    
    if (['low', 'medium', 'high'].includes(priority)) {
      return priority as 'low' | 'medium' | 'high';
    }
    return 'medium';
  } catch (error) {
    console.error('Lỗi khi xác định độ ưu tiên:', error);
    return 'medium';
  }
};

// Function to generate intelligent task schedule
export const generateTaskSchedule = async (taskDescription: string, numberOfDays: number): Promise<Array<{ title: string; day: number; time?: string }>> => {
  try {
    const prompt = `
    You are an AI productivity assistant. Break down the following task into a realistic schedule over ${numberOfDays} day(s):
    
    Task: "${taskDescription}"
    
    Guidelines:
    - Split the work logically across ${numberOfDays} day(s)
    - Each day should have 1-3 manageable subtasks
    - Consider natural workflow and dependencies
    - Include preparation, execution, and review phases where appropriate
    - Suggest optimal times for different types of work (morning for creative work, afternoon for meetings, etc.)
    - Each subtask should be achievable in 1-4 hours
    - Be specific and actionable
    
    Return a JSON array with this exact format:
    [
      {
        "title": "Specific task description",
        "day": 1,
        "time": "09:00" (optional, suggest optimal time in 24h format)
      }
    ]
    
    Example for "Prepare presentation for client meeting" over 3 days:
    [
      {
        "title": "Research client background and requirements",
        "day": 1,
        "time": "09:00"
      },
      {
        "title": "Create presentation outline and structure",
        "day": 1,
        "time": "14:00"
      },
      {
        "title": "Design slides and add content",
        "day": 2,
        "time": "09:00"
      },
      {
        "title": "Review and refine presentation",
        "day": 2,
        "time": "15:00"
      },
      {
        "title": "Practice presentation and prepare for Q&A",
        "day": 3,
        "time": "10:00"
      }
    ]
    
    Return ONLY the JSON array, no additional text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse JSON response
    try {
      const schedule = JSON.parse(text);
      
      // Validate the response format
      if (Array.isArray(schedule) && schedule.every(item => 
        typeof item.title === 'string' && 
        typeof item.day === 'number' &&
        item.day >= 1 && item.day <= numberOfDays
      )) {
        return schedule;
      } else {
        throw new Error('Invalid schedule format');
      }
    } catch {
      console.error('Failed to parse AI response:', text);
      // Fallback schedule
      return generateFallbackSchedule(taskDescription, numberOfDays);
    }
  } catch (error) {
    console.error('Error generating task schedule:', error);
    return generateFallbackSchedule(taskDescription, numberOfDays);
  }
};

// Fallback schedule generator
const generateFallbackSchedule = (taskDescription: string, numberOfDays: number): Array<{ title: string; day: number; time?: string }> => {
  const schedule = [];
  
  if (numberOfDays === 1) {
    schedule.push(
      { title: `Start work on: ${taskDescription}`, day: 1, time: "09:00" },
      { title: `Continue and complete: ${taskDescription}`, day: 1, time: "14:00" }
    );
  } else {
    schedule.push({ title: `Plan and research for: ${taskDescription}`, day: 1, time: "09:00" });
    
    for (let day = 2; day < numberOfDays; day++) {
      schedule.push({ title: `Work on: ${taskDescription} (Day ${day})`, day, time: "09:00" });
    }
    
    schedule.push({ title: `Finalize and review: ${taskDescription}`, day: numberOfDays, time: "09:00" });
  }
  
  return schedule;
};
// Function to break down a complex task into smaller actionable steps
export const generateTaskBreakdown = async (task: string): Promise<string[]> => {
  try {
    const prompt = `
    Break down this task into 3-5 smaller, actionable sub-tasks:
    "${task}"
    
    Guidelines:
    - Each sub-task should be specific and actionable
    - Sub-tasks should be achievable in 15-30 minutes
    - Use clear, simple language
    - Focus on practical steps
    - Don't include the original task
    
    Examples:
    Input: "Plan a birthday party"
    Output:
    - Create guest list and send invitations
    - Choose and book venue or prepare home space
    - Plan menu and order/buy food
    - Buy decorations and party supplies
    - Prepare entertainment or activities
    
    Return each sub-task on a new line, no numbering or bullets.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const breakdown = response.text()
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.match(/^[-\d+.)\s]/) && !s.toLowerCase().includes('input:') && !s.toLowerCase().includes('output:'))
      .slice(0, 5);
    
    return breakdown;
  } catch (error) {
    console.error('Error generating task breakdown:', error);
    return [];
  }
};

// Hàm AI để tạo gợi ý todo thông minh
export const generateSmartSuggestions = async (existingTodos: Todo[]): Promise<string[]> => {
  try {
    const todoTexts = existingTodos.map(todo => todo.text).join(', ');
    
    const prompt = `
    Based on existing todos: "${todoTexts}"
    
    Generate 4-6 smart task suggestions that:
    - Break down daily activities into smaller, actionable tasks
    - Complement existing tasks without duplication
    - Are practical and achievable within a day
    - Cover different life areas (work, health, personal, learning)
    - Use specific, actionable language
    
    Examples of good suggestions:
    - "Review emails and respond to urgent ones"
    - "Take a 10-minute walk outside"
    - "Prepare tomorrow's outfit"
    - "Drink 2 glasses of water"
    - "Review today's accomplishments"
    
    Return each suggestion on a new line, no numbering.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestions = response.text()
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.match(/^\d+[.)\s]/))
      .slice(0, 6);
    
    return suggestions;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [
      "Review and organize your workspace",
      "Take a 5-minute breathing break",
      "Plan tomorrow's priorities",
      "Drink a glass of water",
      "Send a quick message to a friend or family member"
    ];
  }
};