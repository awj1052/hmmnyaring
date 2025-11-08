/**
 * 시드 데이터 생성 스크립트
 * 
 * 실행: pnpm db:seed
 */

import { PrismaClient, Language, TourCategory, UserRole, TourRequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 기존 데이터 삭제 (개발 환경에서만!)
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.tourRequest.deleteMany();
  await prisma.guideProfile.deleteMany();
  await prisma.travelerProfile.deleteMany();
  await prisma.tourLocation.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ 기존 데이터 삭제 완료');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 가이드 10명 생성
  const guides = await Promise.all([
    prisma.user.create({
      data: {
        email: 'guide1@example.com',
        name: '김대전',
        password: hashedPassword,
        role: UserRole.GUIDE,
        image: null,
        guideProfile: {
          create: {
            bio: '안녕하세요! 대전에서 15년째 살고 있는 김대전입니다. 성심당과 대전 맛집 투어 전문가예요. 일본어와 영어가 가능하며, 친절한 안내로 대전의 진짜 맛을 보여드릴게요!',
            phoneNumber: '010-1234-5678',
            languages: [Language.KOREAN, Language.JAPANESE, Language.ENGLISH],
            categories: [TourCategory.FOOD, TourCategory.CAFE],
            certifications: ['JLPT N2', 'TOEIC 900+'],
            availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
            isVerified: true,
            totalTours: 45,
            averageRating: 4.8,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'guide2@example.com',
        name: '박문화',
        password: hashedPassword,
        role: UserRole.GUIDE,
        image: null,
        guideProfile: {
          create: {
            bio: '대전의 역사와 문화를 사랑하는 가이드입니다. 엑스포 과학공원, 뿌리공원, 대전 근현대사 전시관 등 대전의 역사적 명소를 함께 돌아보겠습니다. 중국어 가능!',
            phoneNumber: '010-2345-6789',
            languages: [Language.KOREAN, Language.CHINESE],
            categories: [TourCategory.HISTORY, TourCategory.NATURE],
            certifications: ['HSK 6급', '문화관광해설사'],
            availableDays: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
            isVerified: true,
            totalTours: 32,
            averageRating: 4.9,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'guide3@example.com',
        name: '이카페',
        password: hashedPassword,
        role: UserRole.GUIDE,
        image: null,
        guideProfile: {
          create: {
            bio: '대전 카페 투어 전문가입니다! 성심당뿐만 아니라 숨겨진 루프탑 카페, 감성 카페들을 소개해드려요. 인스타 감성 사진 찍기 좋은 곳들을 안내합니다.',
            phoneNumber: '010-3456-7890',
            languages: [Language.KOREAN, Language.ENGLISH],
            categories: [TourCategory.CAFE, TourCategory.FOOD],
            certifications: ['바리스타 2급'],
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            isVerified: true,
            totalTours: 28,
            averageRating: 4.7,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'guide4@example.com',
        name: '최자연',
        password: hashedPassword,
        role: UserRole.GUIDE,
        image: null,
        guideProfile: {
          create: {
            bio: '대전의 자연을 사랑하는 가이드입니다. 한밭수목원, 계룡산, 대청호 등 대전 근교의 아름다운 자연을 함께 걸어요. 힐링이 필요하신 분들께 추천합니다!',
            phoneNumber: '010-4567-8901',
            languages: [Language.KOREAN],
            categories: [TourCategory.NATURE],
            certifications: ['생태관광 가이드'],
            availableDays: ['Saturday', 'Sunday'],
            isVerified: true,
            totalTours: 18,
            averageRating: 4.9,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'guide5@example.com',
        name: '정쇼핑',
        password: hashedPassword,
        role: UserRole.GUIDE,
        image: null,
        guideProfile: {
          create: {
            bio: '대전 은행동 카페거리, 중앙시장, 성심당 쇼핑 투어 전문가입니다. 대전에서만 살 수 있는 특산품과 기념품을 소개해드려요!',
            phoneNumber: '010-5678-9012',
            languages: [Language.KOREAN, Language.ENGLISH],
            categories: [TourCategory.SHOPPING, TourCategory.FOOD],
            certifications: [],
            availableDays: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
            isVerified: false,
            totalTours: 12,
            averageRating: 4.5,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'guide6@example.com',
        name: '강나잇',
        password: hashedPassword,
        role: UserRole.GUIDE,
        image: null,
        guideProfile: {
          create: {
            bio: '대전의 밤 문화를 소개합니다! 둔산동 술집 거리, 유성 온천 근처 맛집, 야경 명소 등 대전의 나이트라이프를 안전하게 즐겨보세요.',
            phoneNumber: '010-6789-0123',
            languages: [Language.KOREAN, Language.ENGLISH],
            categories: [TourCategory.NIGHTLIFE, TourCategory.FOOD],
            certifications: [],
            availableDays: ['Friday', 'Saturday'],
            isVerified: true,
            totalTours: 22,
            averageRating: 4.6,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'guide7@example.com',
        name: '윤맛집',
        password: hashedPassword,
        role: UserRole.GUIDE,
        image: null,
        guideProfile: {
          create: {
            bio: '대전 맛집만 20년! 성심당은 기본이고, 칼국수, 순대국밥, 돈까스 골목 등 진짜 대전 사람들이 가는 맛집을 소개해드립니다.',
            phoneNumber: '010-7890-1234',
            languages: [Language.KOREAN, Language.JAPANESE],
            categories: [TourCategory.FOOD],
            certifications: [],
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            isVerified: true,
            totalTours: 38,
            averageRating: 4.9,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'guide8@example.com',
        name: '송역사',
        password: hashedPassword,
        role: UserRole.GUIDE,
        image: null,
        guideProfile: {
          create: {
            bio: '대전 역사 해설사입니다. 대전의 근현대사, 6.25 전쟁 관련 유적지, 대전 근대 건축물 투어를 진행합니다. 스페인어 가능!',
            phoneNumber: '010-8901-2345',
            languages: [Language.KOREAN, Language.SPANISH, Language.ENGLISH],
            categories: [TourCategory.HISTORY],
            certifications: ['문화관광해설사', 'DELE B2'],
            availableDays: ['Saturday', 'Sunday'],
            isVerified: true,
            totalTours: 15,
            averageRating: 4.8,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'guide9@example.com',
        name: '한종합',
        password: hashedPassword,
        role: UserRole.GUIDE,
        image: null,
        guideProfile: {
          create: {
            bio: '대전의 모든 것을 안내하는 올라운드 가이드입니다! 맛집, 카페, 역사, 쇼핑 모두 가능해요. 프랑스어도 가능합니다!',
            phoneNumber: '010-9012-3456',
            languages: [Language.KOREAN, Language.ENGLISH, Language.FRENCH],
            categories: [
              TourCategory.FOOD,
              TourCategory.CAFE,
              TourCategory.HISTORY,
              TourCategory.SHOPPING,
            ],
            certifications: ['DELF B2', '관광통역안내사'],
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            isVerified: true,
            totalTours: 52,
            averageRating: 4.9,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'guide10@example.com',
        name: '임청년',
        password: hashedPassword,
        role: UserRole.GUIDE,
        image: null,
        guideProfile: {
          create: {
            bio: '대전 청년 가이드입니다! 젊은 감각으로 SNS에 올릴 만한 핫플레이스, 인생샷 명소를 안내해드려요. 온라인 투어도 가능!',
            phoneNumber: '010-0123-4567',
            languages: [Language.KOREAN, Language.ENGLISH],
            categories: [TourCategory.CAFE, TourCategory.SHOPPING, TourCategory.NIGHTLIFE],
            certifications: [],
            availableDays: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
            isVerified: false,
            totalTours: 8,
            averageRating: 4.4,
          },
        },
      },
    }),
  ]);

  console.log('✅ 가이드 10명 생성 완료');

  // 여행자 5명 생성
  const travelers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'traveler1@example.com',
        name: '사토 유키',
        password: hashedPassword,
        role: UserRole.TRAVELER,
        image: null,
        travelerProfile: {
          create: {
            nationality: '일본',
            preferredLanguages: [Language.JAPANESE, Language.KOREAN],
            interests: [TourCategory.FOOD, TourCategory.CAFE, TourCategory.SHOPPING],
            visitStartDate: new Date('2025-11-15'),
            visitEndDate: new Date('2025-11-18'),
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'traveler2@example.com',
        name: 'John Smith',
        password: hashedPassword,
        role: UserRole.TRAVELER,
        image: null,
        travelerProfile: {
          create: {
            nationality: '미국',
            preferredLanguages: [Language.ENGLISH],
            interests: [TourCategory.HISTORY, TourCategory.NATURE],
            visitStartDate: new Date('2025-11-20'),
            visitEndDate: new Date('2025-11-25'),
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'traveler3@example.com',
        name: '왕리',
        password: hashedPassword,
        role: UserRole.TRAVELER,
        image: null,
        travelerProfile: {
          create: {
            nationality: '중국',
            preferredLanguages: [Language.CHINESE, Language.KOREAN],
            interests: [TourCategory.SHOPPING, TourCategory.FOOD],
            visitStartDate: new Date('2025-12-01'),
            visitEndDate: new Date('2025-12-05'),
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'traveler4@example.com',
        name: 'Marie Dupont',
        password: hashedPassword,
        role: UserRole.TRAVELER,
        image: null,
        travelerProfile: {
          create: {
            nationality: '프랑스',
            preferredLanguages: [Language.FRENCH, Language.ENGLISH],
            interests: [TourCategory.HISTORY, TourCategory.CAFE],
            visitStartDate: new Date('2025-11-18'),
            visitEndDate: new Date('2025-11-22'),
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'traveler5@example.com',
        name: '김한국',
        password: hashedPassword,
        role: UserRole.TRAVELER,
        image: null,
        travelerProfile: {
          create: {
            nationality: '한국',
            preferredLanguages: [Language.KOREAN],
            interests: [TourCategory.NATURE, TourCategory.CAFE],
            visitStartDate: new Date('2025-11-10'),
            visitEndDate: new Date('2025-11-12'),
          },
        },
      },
    }),
  ]);

  console.log('✅ 여행자 5명 생성 완료');

  // 투어 요청 생성
  const tourRequests = [];

  // 완료된 투어 (리뷰 있음)
  for (let i = 0; i < 5; i++) {
    const traveler = travelers[i % travelers.length];
    const guide = guides[i % guides.length];

    const request = await prisma.tourRequest.create({
      data: {
        travelerId: traveler.id,
        guideId: guide.id,
        requestedDate: new Date(Date.now() + (i - 10) * 24 * 60 * 60 * 1000),
        message: `안녕하세요! 대전 여행을 계획 중입니다. ${guide.name}님의 투어가 정말 기대되네요. 잘 부탁드립니다!`,
        category: [TourCategory.FOOD, TourCategory.CAFE, TourCategory.HISTORY][i % 3],
        isOnline: i % 3 === 0,
        status: TourRequestStatus.COMPLETED,
      },
    });

    tourRequests.push(request);

    // 리뷰 생성
    await prisma.review.create({
      data: {
        tourRequestId: request.id,
        authorId: traveler.id,
        receiverId: guide.id,
        rating: 4 + (i % 2),
        comment: [
          '정말 유익한 투어였습니다! 성심당 튀김소보루가 진짜 맛있네요. 다음에 또 대전 오면 연락드릴게요!',
          '대전의 역사를 잘 설명해주셔서 감사합니다. 덕분에 대전을 더 깊이 이해할 수 있었어요.',
          '숨은 카페들이 정말 좋았어요! 인스타 사진도 많이 찍었습니다. 추천해주신 케이크도 맛있었어요.',
          '친절하게 안내해주셔서 감사합니다. 한국어가 서툰데도 천천히 설명해주셔서 이해하기 쉬웠어요.',
          '대전 맛집 투어 최고였습니다! 칼국수, 순대국, 돈까스 모두 맛있었어요. 배불러요 ㅎㅎ',
        ][i % 5],
      },
    });
  }

  console.log('✅ 완료된 투어 및 리뷰 5개 생성');

  // 수락된 투어 (채팅방 있음)
  for (let i = 0; i < 3; i++) {
    const traveler = travelers[(i + 1) % travelers.length];
    const guide = guides[(i + 3) % guides.length];

    const request = await prisma.tourRequest.create({
      data: {
        travelerId: traveler.id,
        guideId: guide.id,
        requestedDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
        message: `${guide.name}님, 투어 신청합니다! 대전이 처음이라 기대가 많이 되네요.`,
        category: [TourCategory.SHOPPING, TourCategory.NATURE, TourCategory.NIGHTLIFE][i % 3],
        isOnline: false,
        status: TourRequestStatus.ACCEPTED,
        chatRoom: {
          create: {
            messages: {
              create: [
                {
                  senderId: traveler.id,
                  content: '안녕하세요! 투어 신청한 사람입니다.',
                  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                },
                {
                  senderId: guide.id,
                  content: '네 안녕하세요! 투어 신청 감사합니다. 어떤 장소를 특히 가보고 싶으신가요?',
                  createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
                },
                {
                  senderId: traveler.id,
                  content: '대전 명소들을 골고루 보고 싶어요!',
                  createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                },
                {
                  senderId: guide.id,
                  content: '좋습니다! 그럼 성심당에서 만나서 시작할까요?',
                  createdAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
                },
              ],
            },
          },
        },
      },
    });

    tourRequests.push(request);
  }

  console.log('✅ 수락된 투어 및 채팅 3개 생성');

  // 대기 중인 투어
  for (let i = 0; i < 7; i++) {
    const traveler = travelers[(i + 2) % travelers.length];
    const guide = guides[(i + 5) % guides.length];

    const request = await prisma.tourRequest.create({
      data: {
        travelerId: traveler.id,
        guideId: guide.id,
        requestedDate: new Date(Date.now() + (i + 5) * 24 * 60 * 60 * 1000),
        message: [
          '대전 맛집 투어 부탁드립니다!',
          '역사적인 장소들을 둘러보고 싶습니다.',
          '카페 투어 신청합니다. 사진 찍기 좋은 곳으로 부탁해요!',
          '자연 경관이 아름다운 곳을 가보고 싶어요.',
          '쇼핑하기 좋은 곳 안내 부탁드립니다.',
          '대전의 밤 문화를 경험하고 싶습니다.',
          '온라인으로 대전 여행 계획 도움받고 싶어요.',
        ][i % 7],
        category: [
          TourCategory.FOOD,
          TourCategory.HISTORY,
          TourCategory.CAFE,
          TourCategory.NATURE,
          TourCategory.SHOPPING,
          TourCategory.NIGHTLIFE,
          TourCategory.FOOD,
        ][i % 7],
        isOnline: i === 6,
        status: TourRequestStatus.PENDING,
      },
    });

    tourRequests.push(request);
  }

  console.log('✅ 대기 중인 투어 7개 생성');

  // 대전 관광지 정보
  const locations = await Promise.all([
    prisma.tourLocation.create({
      data: {
        name: '성심당 본점',
        description:
          '대전을 대표하는 제과점. 튀김소보루가 유명하며, 항상 줄을 서서 기다려야 하는 대전 필수 코스입니다.',
        category: TourCategory.FOOD,
        latitude: 36.3285,
        longitude: 127.4258,
        address: '대전광역시 중구 은행동 145',
        imageUrl: null,
      },
    }),
    prisma.tourLocation.create({
      data: {
        name: '한밭수목원',
        description: '국내 최대 규모의 인공 수목원으로, 계절마다 다른 아름다움을 선사합니다.',
        category: TourCategory.NATURE,
        latitude: 36.3668,
        longitude: 127.3895,
        address: '대전광역시 서구 둔산대로 169',
        imageUrl: null,
      },
    }),
    prisma.tourLocation.create({
      data: {
        name: '대전 엑스포 과학공원',
        description: '1993년 대전엑스포가 열렸던 장소로, 과학관과 아름다운 공원이 있습니다.',
        category: TourCategory.HISTORY,
        latitude: 36.3726,
        longitude: 127.3840,
        address: '대전광역시 유성구 대덕대로 480',
        imageUrl: null,
      },
    }),
    prisma.tourLocation.create({
      data: {
        name: '은행동 카페거리',
        description: '성심당 근처에 위치한 감성 카페 거리. 다양한 분위기의 카페들이 모여있습니다.',
        category: TourCategory.CAFE,
        latitude: 36.3275,
        longitude: 127.4270,
        address: '대전광역시 중구 은행동 일대',
        imageUrl: null,
      },
    }),
    prisma.tourLocation.create({
      data: {
        name: '대전 중앙시장',
        description: '대전의 전통시장으로, 다양한 먹거리와 볼거리가 가득합니다.',
        category: TourCategory.SHOPPING,
        latitude: 36.3262,
        longitude: 127.4201,
        address: '대전광역시 동구 중앙로 123',
        imageUrl: null,
      },
    }),
    prisma.tourLocation.create({
      data: {
        name: '유성온천',
        description: '600년 역사를 자랑하는 온천으로, 다양한 온천 시설과 숙박 시설이 있습니다.',
        category: TourCategory.NATURE,
        latitude: 36.3585,
        longitude: 127.3438,
        address: '대전광역시 유성구 온천로',
        imageUrl: null,
      },
    }),
    prisma.tourLocation.create({
      data: {
        name: '대청호',
        description: '대전과 청주 사이에 있는 인공호수로, 드라이브와 산책하기 좋은 명소입니다.',
        category: TourCategory.NATURE,
        latitude: 36.4578,
        longitude: 127.4839,
        address: '대전광역시 대덕구 미호동',
        imageUrl: null,
      },
    }),
    prisma.tourLocation.create({
      data: {
        name: '뿌리공원',
        description: '한국인의 성씨 조형물이 전시된 독특한 공원입니다.',
        category: TourCategory.HISTORY,
        latitude: 36.3045,
        longitude: 127.4358,
        address: '대전광역시 중구 뿌리공원로 79',
        imageUrl: null,
      },
    }),
    prisma.tourLocation.create({
      data: {
        name: '대전역',
        description: '대전의 중심 역사로, 주변에 다양한 맛집과 카페가 있습니다.',
        category: TourCategory.FOOD,
        latitude: 36.3325,
        longitude: 127.4353,
        address: '대전광역시 동구 중앙로 215',
        imageUrl: null,
      },
    }),
    prisma.tourLocation.create({
      data: {
        name: '둔산선사유적지',
        description: '청동기 시대 유적지로, 대전의 역사를 배울 수 있는 장소입니다.',
        category: TourCategory.HISTORY,
        latitude: 36.3544,
        longitude: 127.3782,
        address: '대전광역시 서구 둔산로 121',
        imageUrl: null,
      },
    }),
  ]);

  console.log('✅ 대전 관광지 10곳 생성');

  console.log('\n🎉 시드 데이터 생성 완료!\n');
  console.log('📊 생성된 데이터:');
  console.log(`  - 가이드: ${guides.length}명`);
  console.log(`  - 여행자: ${travelers.length}명`);
  console.log(`  - 투어 요청: ${tourRequests.length}개`);
  console.log(`  - 관광지: ${locations.length}곳`);
  console.log('\n🔑 테스트 계정:');
  console.log('  가이드1: guide1@example.com / password123');
  console.log('  가이드2: guide2@example.com / password123');
  console.log('  여행자1: traveler1@example.com / password123');
  console.log('  여행자2: traveler2@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
