import { faker } from '@faker-js/faker';

const generateArticles = () => {
  const articles = [];

  for (let i = 0; i < 15; i++) {
    articles.push({
      id: i + 1,
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      author: faker.person.fullName(),
      date: faker.date.between({ from: '2024-01-01', to: '2026-06-13' }),
      content: faker.lorem.paragraphs({ min: 5, max: 10 }, '\n\n'),
      category: faker.helpers.arrayElement(['Știri', 'Sport', 'Cultură', 'Știință', 'Evenimente'])
    });
  }

  return articles.sort((a, b) => b.date - a.date);
};

export const articles = generateArticles();
