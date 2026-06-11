import { fakerPT_BR as faker } from '@faker-js/faker';
import { PrismaClient, Role, MentorshipStatus, NotificationType, ConnectionStatus } from '@prisma/client';
import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';

const PASSWORD = 'Senha123';
const CATEGORIES = ['HealthTech', 'EdTech', 'BeautyTech', 'AgriTech', 'FinTech', 'FashionTech'];
const STAGES = ['IDEA', 'MVP', 'TRACTION', 'SCALE'];
const CITIES = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Recife', 'Florianópolis'];
const EVENT_TYPES = ['Workshop', 'Pitch Day', 'Networking', 'Painel', 'Demo Day'];

type SeedUser = {
  id: string;
  email: string;
  role: Role;
};

type SeedStartup = {
  id: string;
  founderId: string;
};

export async function runEnterpriseSeed(prisma: PrismaClient): Promise<void> {
  faker.seed(20260603);

  const password = await bcrypt.hash(PASSWORD, 10);
  const users = await seedUsers(prisma, password);
  const startups = await seedStartups(prisma, users);
  await seedMentorships(prisma, users, startups);
  await seedEvents(prisma, users);
  await seedConnections(prisma, users);
  await seedNotifications(prisma, users);
  await seedAuditLogs(prisma, users, startups);
  await seedMongo(users);

  const admin = users.find((user) => user.role === Role.ADMIN);
  console.log({
    message: 'Enterprise seed completed.',
    defaultPassword: PASSWORD,
    admin: admin?.email,
    users: users.length,
    startups: startups.length,
  });
}

async function seedUsers(prisma: PrismaClient, password: string): Promise<SeedUser[]> {
  const distribution: Role[] = [
    ...Array.from({ length: 25 }, () => Role.ENTREPRENEUR),
    ...Array.from({ length: 15 }, () => Role.MENTOR),
    ...Array.from({ length: 8 }, () => Role.INVESTOR),
    ...Array.from({ length: 2 }, () => Role.ADMIN),
  ];

  const users: SeedUser[] = [];

  for (let index = 0; index < distribution.length; index += 1) {
    const role = distribution[index];
    const firstName = faker.person.firstName('female');
    const lastName = faker.person.lastName();
    const email =
      index === 0
        ? 'admin@sheconnect.com'
        : `${firstName}.${lastName}.${index}@sheconnect.com`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: `${firstName} ${lastName}`,
        role,
        bio: profileBio(role),
        linkedin: `https://www.linkedin.com/in/${faker.internet.username({ firstName, lastName }).toLowerCase()}`,
        city: faker.helpers.arrayElement(CITIES),
        profileImage: faker.image.avatar(),
        specialty: faker.helpers.arrayElement(CATEGORIES),
        experienceYears: faker.number.int({ min: role === Role.ENTREPRENEUR ? 1 : 4, max: 22 }),
      },
      create: {
        name: `${firstName} ${lastName}`,
        email,
        password,
        role,
        bio: profileBio(role),
        linkedin: `https://www.linkedin.com/in/${faker.internet.username({ firstName, lastName }).toLowerCase()}`,
        city: faker.helpers.arrayElement(CITIES),
        profileImage: faker.image.avatar(),
        specialty: faker.helpers.arrayElement(CATEGORIES),
        experienceYears: faker.number.int({ min: role === Role.ENTREPRENEUR ? 1 : 4, max: 22 }),
      },
    });

    users.push({ id: user.id, email: user.email, role: user.role });
  }

  return users;
}

async function seedStartups(prisma: PrismaClient, users: SeedUser[]): Promise<SeedStartup[]> {
  const entrepreneurs = users.filter((user) => user.role === Role.ENTREPRENEUR);
  const startups: SeedStartup[] = [];

  for (let index = 0; index < 20; index += 1) {
    const founder = entrepreneurs[index % entrepreneurs.length];
    const category = CATEGORIES[index % CATEGORIES.length];
    const startup = await prisma.startup.upsert({
      where: { id: seededUuid('1000', index) },
      update: {
        founderId: founder.id,
        name: `${faker.company.name()} ${category}`,
        description: faker.company.catchPhrase(),
        category,
        stage: STAGES[index % STAGES.length],
        investmentGoal: faker.number.float({ min: 80000, max: 1500000, fractionDigits: 2 }),
        valuation: faker.number.float({ min: 300000, max: 8000000, fractionDigits: 2 }),
        city: faker.helpers.arrayElement(CITIES),
        website: faker.internet.url(),
        pitch: faker.lorem.paragraph(),
      },
      create: {
        id: seededUuid('1000', index),
        founderId: founder.id,
        name: `${faker.company.name()} ${category}`,
        description: faker.company.catchPhrase(),
        category,
        stage: STAGES[index % STAGES.length],
        investmentGoal: faker.number.float({ min: 80000, max: 1500000, fractionDigits: 2 }),
        valuation: faker.number.float({ min: 300000, max: 8000000, fractionDigits: 2 }),
        city: faker.helpers.arrayElement(CITIES),
        website: faker.internet.url(),
        pitch: faker.lorem.paragraph(),
      },
    });

    startups.push({ id: startup.id, founderId: startup.founderId });
  }

  return startups;
}

async function seedMentorships(prisma: PrismaClient, users: SeedUser[], startups: SeedStartup[]): Promise<void> {
  const entrepreneurs = users.filter((user) => user.role === Role.ENTREPRENEUR);
  const mentors = users.filter((user) => user.role === Role.MENTOR);
  const statuses = Object.values(MentorshipStatus);

  for (let index = 0; index < 40; index += 1) {
    const status = statuses[index % statuses.length];
    const startup = startups[index % startups.length];
    const entrepreneur = entrepreneurs.find((user) => user.id === startup.founderId) ?? entrepreneurs[index % entrepreneurs.length];
    const mentor = mentors[index % mentors.length];

    await prisma.mentorship.upsert({
      where: { id: seededUuid('2000', index) },
      update: mentorshipPayload(index, entrepreneur.id, mentor.id, startup.id, status),
      create: {
        id: seededUuid('2000', index),
        ...mentorshipPayload(index, entrepreneur.id, mentor.id, startup.id, status),
      },
    });
  }
}

async function seedEvents(prisma: PrismaClient, users: SeedUser[]): Promise<void> {
  const organizers = users.filter((user) => user.role === Role.ADMIN || user.role === Role.MENTOR);

  for (let index = 0; index < 15; index += 1) {
    const organizer = organizers[index % organizers.length];
    const event = await prisma.event.upsert({
      where: { id: seededUuid('3000', index) },
      update: eventPayload(index, organizer.id),
      create: {
        id: seededUuid('3000', index),
        ...eventPayload(index, organizer.id),
      },
    });

    const participants = faker.helpers.arrayElements(users, faker.number.int({ min: 5, max: 18 }));
    for (const participant of participants) {
      await prisma.eventRegistration.upsert({
        where: { userId_eventId: { userId: participant.id, eventId: event.id } },
        update: {},
        create: { userId: participant.id, eventId: event.id },
      });
    }
  }
}

async function seedConnections(prisma: PrismaClient, users: SeedUser[]): Promise<void> {
  const nonAdmins = users.filter((user) => user.role !== Role.ADMIN);
  const statuses = Object.values(ConnectionStatus);

  for (let index = 0; index < 35; index += 1) {
    const requester = nonAdmins[index % nonAdmins.length];
    const receiver = nonAdmins[(index + 9) % nonAdmins.length];

    if (requester.id === receiver.id) {
      continue;
    }

    await prisma.userConnection.upsert({
      where: { requesterId_receiverId: { requesterId: requester.id, receiverId: receiver.id } },
      update: { status: statuses[index % statuses.length] },
      create: {
        requesterId: requester.id,
        receiverId: receiver.id,
        status: statuses[index % statuses.length],
      },
    });
  }
}

async function seedNotifications(prisma: PrismaClient, users: SeedUser[]): Promise<void> {
  for (const user of users.slice(0, 30)) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Bem-vinda à SheConnect',
        message: 'Sua rede de negócios está pronta para novas conexões.',
        type: NotificationType.INFO,
      },
    });
  }
}

async function seedAuditLogs(prisma: PrismaClient, users: SeedUser[], startups: SeedStartup[]): Promise<void> {
  const admin = users.find((user) => user.role === Role.ADMIN) ?? users[0];

  await prisma.auditLog.createMany({
    data: [
      {
        action: 'REGISTER',
        entity: 'User',
        entityId: users[1].id,
        userId: users[1].id,
        newValue: { email: users[1].email, role: users[1].role },
        afterData: { email: users[1].email, role: users[1].role },
        ipAddress: '127.0.0.1',
        userAgent: 'SeedBot/1.0',
      },
      {
        action: 'CREATE',
        entity: 'Startup',
        entityId: startups[0].id,
        userId: startups[0].founderId,
        newValue: { id: startups[0].id },
        afterData: { id: startups[0].id },
        ipAddress: '127.0.0.1',
        userAgent: 'SeedBot/1.0',
      },
      {
        action: 'LOGIN',
        entity: 'User',
        entityId: admin.id,
        userId: admin.id,
        newValue: { email: admin.email },
        afterData: { email: admin.email },
        ipAddress: '127.0.0.1',
        userAgent: 'SeedBot/1.0',
      },
    ],
    skipDuplicates: true,
  });
}

async function seedMongo(users: SeedUser[]): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE ?? 'sheconnect');
    const messages = db.collection('chat_messages');
    const eventLogs = db.collection('event_logs');
    await messages.deleteMany({ seeded: true });
    await eventLogs.deleteMany({ seeded: true });

    const chatMessages = Array.from({ length: 100 }, (_, index) => {
      const sender = users[index % users.length];
      const receiver = users[(index + 7) % users.length];
      return {
        conversationId: [sender.id, receiver.id].sort().join(':'),
        senderId: sender.id,
        receiverId: receiver.id,
        message: faker.lorem.sentence({ min: 6, max: 18 }),
        read: index % 3 === 0,
        createdAt: faker.date.recent({ days: 45 }),
        seeded: true,
      };
    });

    await messages.insertMany(chatMessages);
    await eventLogs.insertMany([
      {
        eventType: 'EnterpriseSeedCompleted',
        payload: { users: users.length, messages: chatMessages.length },
        createdAt: new Date(),
        seeded: true,
      },
    ]);
  } catch (error) {
    console.warn(`MongoDB seed skipped: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await client.close();
  }
}

function mentorshipPayload(
  index: number,
  entrepreneurId: string,
  mentorId: string,
  startupId: string,
  status: MentorshipStatus,
) {
  return {
    entrepreneurId,
    mentorId,
    startupId,
    title: `Mentoria ${CATEGORIES[index % CATEGORIES.length]} ${index + 1}`,
    description: faker.lorem.paragraph(),
    category: CATEGORIES[index % CATEGORIES.length],
    status,
    scheduledAt: faker.date.soon({ days: 45 }),
    mentorshipArea: CATEGORIES[index % CATEGORIES.length],
    initialMessage: faker.lorem.sentence(),
    feedback: status === MentorshipStatus.CONCLUIDA ? faker.lorem.paragraph() : null,
    rating: status === MentorshipStatus.CONCLUIDA ? faker.number.int({ min: 3, max: 5 }) : null,
    completedAt: status === MentorshipStatus.CONCLUIDA ? faker.date.recent({ days: 30 }) : null,
  };
}

function eventPayload(index: number, organizerId: string) {
  const type = EVENT_TYPES[index % EVENT_TYPES.length];
  return {
    title: `${type} SheConnect ${index + 1}`,
    description: faker.lorem.paragraph(),
    category: CATEGORIES[index % CATEGORIES.length],
    type,
    speaker: faker.person.fullName({ sex: 'female' }),
    location: faker.helpers.arrayElement(CITIES),
    isOnline: index % 4 === 0,
    meetingLink: index % 4 === 0 ? faker.internet.url() : null,
    eventDate: faker.date.soon({ days: 90 }),
    maxAttendees: faker.number.int({ min: 25, max: 120 }),
    organizerId,
  };
}

function profileBio(role: Role): string {
  const descriptions: Record<Role, string> = {
    [Role.ADMIN]: 'Gestora da comunidade SheConnect e responsável por governança da plataforma.',
    [Role.ENTREPRENEUR]: 'Empreendedora liderando soluções inovadoras com impacto para mulheres.',
    [Role.MENTOR]: 'Mentora com experiência em estratégia, crescimento e captação de investimento.',
    [Role.INVESTOR]: 'Investidora interessada em negócios liderados por mulheres e tecnologia de impacto.',
  };

  return descriptions[role];
}

function seededUuid(prefix: string, index: number): string {
  return `00000000-0000-${prefix}-0000-${String(index + 1).padStart(12, '0')}`;
}
