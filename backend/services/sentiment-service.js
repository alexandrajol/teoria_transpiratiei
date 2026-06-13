import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

export const SENTIMENT_COLORS = {
  happy: '#4CAF50',
  angry: '#f44336',
  sad: '#2196F3',
  neutral: '#9E9E9E',
  intrigued: '#FF9800'
};

export async function analyzeSentiment(commentText) {
  try {
    const response = await ollama.chat({
      model: 'qwen2.5:0.5b',  
      messages: [
        {
          role: 'user',
          content: 'Classify: "Mi-a plăcut foarte mult!"'
        },
        {
          role: 'assistant',
          content: 'happy'
        },
        {
          role: 'user',
          content: 'Classify: "Nu sunt de acord, greșit!"'
        },
        {
          role: 'assistant',
          content: 'angry'
        },
        {
          role: 'user',
          content: 'Classify: "Articol trist..."'
        },
        {
          role: 'assistant',
          content: 'sad'
        },
        {
          role: 'user',
          content: 'Classify: "Interesant! Curios să aflu mai mult"'
        },
        {
          role: 'assistant',
          content: 'intrigued'
        },
        {
          role: 'user',
          content: 'Classify: "Informații corecte prezentate"'
        },
        {
          role: 'assistant',
          content: 'neutral'
        },
        {
          role: 'user',
          content: 'Classify: "Sunt curios despre acest subiect"'
        },
        {
          role: 'assistant',
          content: 'intrigued'
        },
        {
          role: 'user',
          content: `Classify: "${commentText}"`
        }
      ],
      options: {
        temperature: 0.1,
        num_predict: 5,
        num_gpu: 0
      }
    });

    const sentiment = response.message.content.trim().toLowerCase();

    const sentimentMap = {
      'happy': 'happy',
      'positive': 'happy',
      'joy': 'happy',
      'joyful': 'happy',
      'excited': 'happy',
      'pleased': 'happy',
      'thankful': 'happy',
      'grateful': 'happy',
      'appreciative': 'happy',
      'delighted': 'happy',
      'glad': 'happy',
      'satisfied': 'happy',
      'angry': 'angry',
      'frustrated': 'angry',
      'upset': 'angry',
      'mad': 'angry',
      'irritated': 'angry',
      'annoyed': 'angry',
      'sad': 'sad',
      'disappointed': 'sad',
      'melancholic': 'sad',
      'unhappy': 'sad',
      'bored': 'sad',
      'discouraged': 'sad',
      'neutral': 'neutral',
      'factual': 'neutral',
      'objective': 'neutral',
      'informative': 'neutral',
      'relevant': 'neutral',
      'intrigued': 'intrigued',
      'curious': 'intrigued',
      'interested': 'intrigued',
      'fascinated': 'intrigued',
      'wondering': 'intrigued',
      'eager': 'intrigued'
    };

    for (const [key, value] of Object.entries(sentimentMap)) {
      if (sentiment.includes(key)) {
        return value;
      }
    }

    console.warn(`Invalid sentiment response: "${sentiment}". Defaulting to neutral.`);
    return 'neutral';

  } catch (error) {
    console.error('Sentiment analysis error:', error);

    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama server is not running. Please start Ollama.');
    }

    return 'neutral';
  }
}

export async function batchAnalyzeSentiments(comments) {
  const results = [];

  for (const comment of comments) {
    try {
      const sentiment = await analyzeSentiment(comment.comment_text);
      results.push({
        id: comment.id,
        sentiment: sentiment,
        color: SENTIMENT_COLORS[sentiment]
      });
    } catch (error) {
      console.error(`Error analyzing comment ${comment.id}:`, error);
      results.push({
        id: comment.id,
        sentiment: 'neutral',
        color: SENTIMENT_COLORS.neutral
      });
    }
  }

  return results;
}

// export async function testSentimentService() {
//   const testComments = [
//     "Foarte interesant articolul! Mi-a plăcut foarte mult.",
//     "Nu sunt deloc de acord cu această abordare. Este greșit!",
//     "Articol trist despre situația actuală...",
//     "Informații factuale prezentate corect.",
//     "Sunt curios să aflu mai multe despre acest subiect."
//   ];

//   console.log('🧪 Testing Sentiment Analysis Service...\n');

//   for (const text of testComments) {
//     try {
//       const sentiment = await analyzeSentiment(text);
//       const color = SENTIMENT_COLORS[sentiment];
//       console.log(`Comment: "${text.substring(0, 50)}..."`);
//       console.log(`Sentiment: ${sentiment.toUpperCase()}`);
//       console.log(`Color: ${color}\n`);
//     } catch (error) {
//       console.error('Test failed:', error.message);
//     }
//   }
// }
