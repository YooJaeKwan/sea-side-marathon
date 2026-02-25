export interface RunningPost {
  id: string
  user: {
    name: string
    avatar: string
    initials: string
  }
  duration: string
  distance: number
  pace: string
  comment: string
  photo?: string
  likes: number
  comments: CommentData[]
  createdAt: string
  liked: boolean
}

export interface CommentData {
  id: string
  user: { name: string; initials: string }
  text: string
  createdAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
}

export interface RankingUser {
  rank: number
  name: string
  initials: string
  avatar: string
  certDays: number
  totalKm: number
}

export const mockPosts: RunningPost[] = [
  {
    id: "1",
    user: { name: "김해찬", avatar: "", initials: "HC" },
    duration: "00:52",
    distance: 8.3,
    pace: "6'16\"",
    comment: "오늘 영종도 해안 도로 따라 뛰었는데 바람이 시원해서 최고였어요! 대회 때도 이런 날씨면 좋겠다.",
    likes: 12,
    comments: [
      { id: "c1", user: { name: "박서연", initials: "SY" }, text: "멋져요! 저도 내일 해안 코스 뛸게요", createdAt: "30분 전" },
    ],
    createdAt: "2시간 전",
    liked: false,
    waved: false,
  },
  {
    id: "2",
    user: { name: "이수민", avatar: "", initials: "SM" },
    duration: "01:05",
    distance: 10.1,
    pace: "6'26\"",
    comment: "드디어 10km 돌파! 거북이의 끈기 배지 획득했습니다!",
    likes: 24,
    comments: [
      { id: "c2", user: { name: "정다은", initials: "DE" }, text: "축하해요!! 대단해!!", createdAt: "1시간 전" },
      { id: "c3", user: { name: "김해찬", initials: "HC" }, text: "갈수록 빨라지네 ㅎㅎ", createdAt: "45분 전" },
    ],
    createdAt: "5시간 전",
    liked: true,
  },
  {
    id: "3",
    user: { name: "박서연", avatar: "", initials: "SY" },
    duration: "00:35",
    distance: 5.5,
    pace: "6'22\"",
    comment: "비 와서 짧게 뛰었지만 기분 좋다!",
    likes: 8,
    comments: [],
    createdAt: "어제",
    liked: false,
  },
  {
    id: "4",
    user: { name: "정다은", avatar: "", initials: "DE" },
    duration: "00:45",
    distance: 7.2,
    pace: "6'15\"",
    comment: "오늘은 인터벌 훈련했어요. 다리가 후들후들 ㅠ 대회까지 화이팅!",
    likes: 15,
    comments: [
      { id: "c4", user: { name: "이수민", initials: "SM" }, text: "고생했어! 내일 같이 뛰자", createdAt: "3시간 전" },
    ],
    createdAt: "어제",
    liked: false,
    waved: false,
  },
]

export const mockBadges: Badge[] = [
  { id: "b1", name: "첫 인증", description: "첫 러닝 인증 완료", icon: "🌱", earned: true, earnedDate: "2026-02-20" },
  { id: "b2", name: "꾸준함", description: "3일 연속 인증", icon: "🔥", earned: true, earnedDate: "2026-02-23" },
  { id: "b3", name: "거북이의 끈기", description: "10km 이상 장거리 달성", icon: "turtle", earned: true, earnedDate: "2026-02-24" },
  { id: "b4", name: "돌고래의 속도", description: "평균 페이스 5분대 달성", icon: "dolphin", earned: false },
  { id: "b5", name: "해류 마스터", description: "7일 연속 인증", icon: "current", earned: false },
  { id: "b6", name: "조개 수집가", description: "월간 인증 20회 달성", icon: "shell", earned: false },
]

export const mockRanking: RankingUser[] = [
  { rank: 1, name: "이수민", initials: "SM", avatar: "", certDays: 18, totalKm: 132.5 },
  { rank: 2, name: "김해찬", initials: "HC", avatar: "", certDays: 16, totalKm: 118.2 },
  { rank: 3, name: "정다은", initials: "DE", avatar: "", certDays: 14, totalKm: 98.7 },
  { rank: 4, name: "박서연", initials: "SY", avatar: "", certDays: 12, totalKm: 88.3 },
  { rank: 5, name: "최준혁", initials: "JH", avatar: "", certDays: 10, totalKm: 72.1 },
  { rank: 6, name: "한예진", initials: "YJ", avatar: "", certDays: 8, totalKm: 55.4 },
  { rank: 7, name: "윤성호", initials: "SH", avatar: "", certDays: 6, totalKm: 41.2 },
]

// Calendar mock: days when runs were logged in Feb 2026
export const mockRunDates = [
  1, 2, 3, 5, 6, 8, 9, 10, 12, 13, 15, 16, 17, 19, 20, 22, 23, 24,
]

export const mockMyStats = {
  totalKm: 118.2,
  totalTime: "14:35:00",
  avgPace: "6'18\"",
  totalRuns: 16,
  streakDays: 3,
}
