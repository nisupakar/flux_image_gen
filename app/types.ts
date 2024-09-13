export interface GeneratedImage {
    id: number;
    image_url: string;
    prompt: string;
    likes_count: number;
    creator_user_id: string;
    created_at: string;
    is_liked?: boolean;
  }