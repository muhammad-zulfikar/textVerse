// types.ts

export interface Note {
  id: string;
  title: string;
  content: string;
  time_created: string | Date;
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

export interface Folder {
  id: string;
  name: string;
}
