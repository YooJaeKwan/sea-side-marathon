require("dotenv").config()
const { PrismaClient } = require("@prisma/client")
const { PrismaNeonHttp } = require("@prisma/adapter-neon")

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter })

const badges = [
    { name: "시작이 반", description: "첫 번째 인증글을 작성했습니다.", icon: "🌱" },
    { name: "꾸준함의 상징", description: "3일 연속으로 인증에 성공했습니다.", icon: "🔥" },
    { name: "러닝 머신", description: "7일 연속으로 인증에 성공했습니다.", icon: "⚡" },
    { name: "철인 28호", description: "한 달(28일) 연속 인증의 대기록!", icon: "🦾" },
    { name: "영종도 앰배서더", description: "누적 거리 50km를 달성했습니다.", icon: "🌊" },
    { name: "울트라 러너", description: "누적 거리 100km를 달성했습니다.", icon: "👑" },
    { name: "지구 한 바퀴 꿈나무", description: "누적 거리 200km를 돌파했습니다!", icon: "🌍" },
    { name: "새벽 공기 수집가", description: "오전 6시 이전에 러닝을 인증했습니다.", icon: "🌅" },
    { name: "심야의 질주", description: "오후 10시 이후에 열정적인 러닝을 인증했습니다.", icon: "🌛" },
    { name: "주말의 전사", description: "토요일과 일요일 모두 인증에 성공했습니다.", icon: "⚔️" },
    { name: "베스트 메이트", description: "동료들로부터 파도(Wave)를 10번 받았습니다.", icon: "🤙" },
    { name: "인기쟁이", description: "게시글에 좋아요가 30개 쌓였습니다.", icon: "💖" },
    { name: "마당발", description: "다른 러너들의 글에 댓글을 20개 남겼습니다.", icon: "🗨️" },
    { name: "폭우를 뚫고", description: "'비'가 오는 날에도 멈추지 않는 열정!", icon: "☔" },
    { name: "해안도로 수호자", description: "10km 부문에서 5회 이상 인증했습니다.", icon: "🛡️" },
    { name: "하프 마스터", description: "5km 부문에서 10회 이상 인증했습니다.", icon: "🎯" },
    { name: "티 타임 리더", description: "Tea 부문 참여자 중 소통왕(댓글 10개)!", icon: "🍵" },
    { name: "페이스 메이커", description: "5명 이상의 러너에게 응원을 보냈습니다.", icon: "🏃" },
    { name: "오늘의 주인공", description: "오늘 하루 가장 먼저 인증글을 올렸습니다.", icon: "⭐" },
    { name: "성장하는 러너", description: "지난달보다 주행 거리가 늘어났습니다!", icon: "📈" }
]

async function main() {
    console.log("Seeding badges...")
    for (const b of badges) {
        const existing = await prisma.badge.findFirst({ where: { name: b.name } })
        if (!existing) {
            await prisma.badge.create({ data: b })
            console.log(`Created badge: ${b.name}`)
        } else {
            await prisma.badge.update({ where: { id: existing.id }, data: b })
            console.log(`Updated badge: ${b.name}`)
        }
    }
    console.log("Seeding complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
