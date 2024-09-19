export interface Note {
  id: string;
  title: string;
  content: string;
  last_edited: string | Date;
  pinned: boolean;
  folder: string;
  time_deleted?: string | Date;
}

export interface PublicNote {
  id: string;
  uid: string;
  publicId: string;
}
