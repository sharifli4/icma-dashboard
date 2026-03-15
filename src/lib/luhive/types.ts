export interface LuhiveCommunity {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logo_url?: string;
  verified?: boolean;
  memberCount: number;
  communityUrl: string;
}

export interface LuhiveEvent {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  location_address?: string;
  online_meeting_link?: string;
  start_time: string;
  end_time?: string;
  timezone: string;
  capacity?: number;
  registration_deadline?: string;
  created_at?: string;
  cover_url?: string;
  community_name?: string;
  community_logo_url?: string;
  eventUrl?: string;
}

export interface LuhiveSuccessResponse<T> {
  success: true;
  data: T[];
}

export interface LuhiveErrorResponse {
  success: false;
  error: string;
}
