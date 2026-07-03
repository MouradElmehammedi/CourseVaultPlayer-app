export type MediaType = "audio" | "video" | "unsupported";

export type Lecture = {
  id: string;
  title: string;
  fileName: string;
  relativePath: string;
  folderPath: string;
  extension: string;
  mediaType: MediaType;
  file: File;
  size: number;
  lastModified: number;
  duration?: number;
  order: number;
};

export type CourseSection = {
  id: string;
  title: string;
  path: string;
  lectures: Lecture[];
  children: CourseSection[];
  isOpen: boolean;
};

export type Course = {
  id: string;
  name: string;
  rootFolderName: string;
  sections: CourseSection[];
  lectures: Lecture[];
  totalLectures: number;
  totalDuration?: number;
};
