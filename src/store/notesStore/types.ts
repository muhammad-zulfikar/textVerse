export interface Note {
  id: string;
  title: string;
  content: string;
  last_edited: string | Date;
  pinned: boolean;
  folder: string;
  time_deleted?: string | Date;
  history?: NoteHistory[];
}

export interface NoteHistory {
  timestamp: string | Date;
  title: string;
  content: string;
}

export interface PublicNote {
  id: string;
  uid: string;
  publicId: string;
}
