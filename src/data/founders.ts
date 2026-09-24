export type Founder = {
  name: string
  role: string
  bio: string | null
  photo: string | null
  linkedin: string | null
}

// bio is null (not a placeholder string) until an approved biography is
// supplied. Company.tsx omits the paragraph entirely when it is null,
// rather than showing stub text on a live, indexable page.
export const founders: Founder[] = [
  {
    name: 'Rob Bailey',
    role: 'Co-founder, Operations',
    bio: null,
    photo: null,
    linkedin: null,
  },
  {
    name: 'Harry Spink',
    role: 'Co-founder, Technical',
    bio: null,
    photo: null,
    linkedin: null,
  },
]
