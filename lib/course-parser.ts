import { hashString } from "@/lib/hash";
import { detectMediaType, getFileExtension, cleanLectureTitle } from "@/lib/media-utils";
import { naturalCompare } from "@/lib/sort";
import type { Course, CourseSection, Lecture } from "@/types/course";

type FileWithRelativePath = File & {
  webkitRelativePath?: string;
};

type MutableSection = CourseSection & {
  childMap: Map<string, MutableSection>;
};

function getRelativePath(file: FileWithRelativePath): string {
  const path = file.webkitRelativePath?.replaceAll("\\", "/");
  return path && path.length > 0 ? path : file.name;
}

function createSection(title: string, path: string): MutableSection {
  return {
    id: hashString(path || "root"),
    title,
    path,
    lectures: [],
    children: [],
    childMap: new Map(),
    isOpen: true,
  };
}

function stripMutableFields(section: MutableSection): CourseSection {
  return {
    id: section.id,
    title: section.title,
    path: section.path,
    lectures: section.lectures,
    children: section.children
      .map((child) => stripMutableFields(child as MutableSection))
      .sort((left, right) => naturalCompare(left.title, right.title)),
    isOpen: section.isOpen,
  };
}

function sortSections(sections: CourseSection[]): CourseSection[] {
  return sections
    .map((section) => ({
      ...section,
      lectures: [...section.lectures].sort((left, right) =>
        naturalCompare(left.fileName, right.fileName),
      ),
      children: sortSections(section.children),
    }))
    .sort((left, right) => naturalCompare(left.title, right.title));
}

function flattenSections(sections: CourseSection[]): Lecture[] {
  const lectures: Lecture[] = [];

  for (const section of sections) {
    lectures.push(...section.lectures);
    lectures.push(...flattenSections(section.children));
  }

  return lectures;
}

export function parseCourseFiles(files: FileList | File[]): Course | null {
  const selectedFiles = Array.from(files as ArrayLike<FileWithRelativePath>);
  const mediaFiles = selectedFiles
    .map((file) => ({ file, mediaType: detectMediaType(file) }))
    .filter((entry): entry is { file: FileWithRelativePath; mediaType: Lecture["mediaType"] } =>
      Boolean(entry.mediaType),
    )
    .sort((left, right) =>
      naturalCompare(getRelativePath(left.file), getRelativePath(right.file)),
    );

  if (mediaFiles.length === 0) {
    return null;
  }

  const firstRelativePath = getRelativePath(mediaFiles[0].file);
  const firstPathParts = firstRelativePath.split("/").filter(Boolean);
  const hasDirectoryPath = firstPathParts.length > 1;
  const rootFolderName = hasDirectoryPath ? firstPathParts[0] : "Selected Course";
  const rootSections = new Map<string, MutableSection>();
  const rootLectures: Lecture[] = [];

  const courseId = hashString(
    `${rootFolderName}:${mediaFiles.length}:${firstRelativePath}`,
  );

  mediaFiles.forEach(({ file, mediaType }, index) => {
    const fullPathParts = getRelativePath(file).split("/").filter(Boolean);
    const relativeParts = hasDirectoryPath ? fullPathParts.slice(1) : fullPathParts;
    const fileName = relativeParts.at(-1) ?? file.name;
    const folderParts = relativeParts.slice(0, -1);
    const folderPath = folderParts.join("/");
    const normalizedRelativePath = relativeParts.join("/") || fileName;
    const extension = getFileExtension(fileName);
    const lectureId = hashString(
      `${normalizedRelativePath}:${file.size}:${file.lastModified}`,
    );

    const lecture: Lecture = {
      id: lectureId,
      title: cleanLectureTitle(fileName) || fileName,
      fileName,
      relativePath: normalizedRelativePath,
      folderPath,
      extension,
      mediaType,
      file,
      size: file.size,
      lastModified: file.lastModified,
      order: index,
    };

    if (folderParts.length === 0) {
      rootLectures.push(lecture);
      return;
    }

    let currentMap = rootSections;
    let currentSection: MutableSection | null = null;
    let currentPath = "";

    for (const folder of folderParts) {
      currentPath = currentPath ? `${currentPath}/${folder}` : folder;
      const existing = currentMap.get(folder);

      if (existing) {
        currentSection = existing;
      } else {
        const section = createSection(folder, currentPath);
        currentMap.set(folder, section);

        if (currentSection) {
          currentSection.children.push(section);
        }

        currentSection = section;
      }

      currentMap = currentSection.childMap;
    }

    currentSection?.lectures.push(lecture);
  });

  let sections = Array.from(rootSections.values()).map(stripMutableFields);

  if (rootLectures.length > 0) {
    sections.unshift({
      id: hashString("root-files"),
      title: "Root files",
      path: "",
      lectures: rootLectures.sort((left, right) =>
        naturalCompare(left.fileName, right.fileName),
      ),
      children: [],
      isOpen: true,
    });
  }

  sections = sortSections(sections);
  const lectures = flattenSections(sections).map((lecture, order) => ({
    ...lecture,
    order,
  }));

  return {
    id: courseId,
    name: rootFolderName,
    rootFolderName,
    sections,
    lectures,
    totalLectures: lectures.length,
  };
}
