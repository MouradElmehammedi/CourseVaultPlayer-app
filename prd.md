\# PRD — Next.js Local Course Media Player



\## 1. Product Name



\*\*CourseVault Player\*\*



A private local media player for Windows/browser that lets the user select a course folder, automatically detect videos and MP3 files inside subfolders, display them in a Udemy-style lecture layout, and track learning progress using `localStorage`.



\---



\## 2. Product Vision



CourseVault Player helps users study downloaded courses without losing progress. The app behaves like a private Udemy-style course player, but it works with local folders on the user’s computer.



The user selects a folder that contains course files. The app scans all subfolders, builds a course curriculum sidebar, displays supported media files as lectures, and saves the progress of every lecture locally in the browser.



No login.

No backend.

No upload.

No cloud storage.

No internet required after the app is opened.



\---



\## 3. Core Problem



The user has downloaded course folders containing:



\* MP3 lessons

\* Video lessons

\* Multiple subfolders

\* Mixed file names

\* Possibly many sections and episodes



Normal media players like VLC can play the files, but they do not give a clean course-learning experience like Udemy.



The user needs:



\* A course folder selector

\* Automatic lecture listing

\* Subfolder organization

\* A modern media player

\* Saved progress per episode

\* Completed/in-progress status

\* Easy resume later

\* Clean Udemy-style interface



\---



\## 4. Target User



Primary user:



\* A developer/student who downloads courses

\* Uses Windows

\* Wants to study offline

\* Wants a clean learning dashboard

\* Wants to track progress without creating an account



Secondary users:



\* People learning languages from MP3 folders

\* People following programming courses

\* People with offline educational content

\* People who prefer private local tools



\---



\## 5. Main User Story



As a learner, I want to select a course folder from my Windows computer, see all videos and MP3 files grouped by folders/subfolders, play lessons one by one, and save my progress automatically so I can continue later.



\---



\## 6. Product Scope



\### MVP Included



The first version should include:



1\. Select course folder

2\. Scan folder and subfolders

3\. Detect supported media files

4\. Build curriculum tree

5\. Expand/collapse folders

6\. Play video or audio

7\. Save progress in `localStorage`

8\. Show progress per lecture

9\. Mark lecture completed automatically

10\. Manual mark as completed

11\. Resume last played lecture

12\. Search lectures

13\. Sort lectures naturally by name

14\. Responsive design

15\. Export/import progress JSON

16\. Clear progress option



\### Not Included in MVP



These should not be built in the first version:



\* User authentication

\* Backend database

\* Cloud sync

\* File upload

\* Online streaming

\* Payment

\* Comments

\* Certificates

\* AI transcript generation

\* Mobile native app

\* Electron desktop packaging



These can be added later.



\---



\## 7. Technical Direction



\### Recommended Stack



Use:



```txt

Next.js App Router

TypeScript

Tailwind CSS

lucide-react

localStorage

Browser File APIs

```



Optional but useful:



```txt

zustand for app state

date-fns for formatting dates

```



Recommended create command:



```bash

npx create-next-app@latest coursevault-player --ts --tailwind --eslint --app

cd coursevault-player

npm install lucide-react zustand date-fns

npm run dev

```



\---



\## 8. Important Browser Limitation



A normal Next.js web app cannot read a Windows folder automatically without user permission.



The user must select a folder manually.



Recommended approach:



\### Option A — Use `webkitdirectory`



Use:



```html

<input type="file" webkitdirectory multiple />

```



Benefits:



\* Simple

\* Works well in Chromium browsers

\* Good for MVP

\* Gives access to all selected files

\* Provides `webkitRelativePath`



Limitations:



\* The user must select the folder again after refreshing the browser if file references are lost

\* Progress can remain saved, but the files themselves must be selected again



\### Option B — Use File System Access API



Use:



```ts

window.showDirectoryPicker()

```



Benefits:



\* More modern

\* Can access folders with permission

\* Better desktop-app feeling



Limitations:



\* Mainly supported in Chromium browsers like Chrome and Edge

\* More complex

\* Persistent folder handles may require IndexedDB, not only localStorage



\### MVP Decision



For the MVP, use `webkitdirectory`.



Save only progress and metadata in `localStorage`.



The user flow becomes:



```txt

Open app

Select course folder

App scans files

App matches saved progress using file path + size + lastModified

User continues studying

```



\---



\## 9. Supported Media Files



\### Audio



Supported:



```txt

.mp3

.wav

.ogg

.m4a

.aac

```



Primary focus:



```txt

.mp3

```



\### Video



Supported:



```txt

.mp4

.webm

.ogg

.mov

```



Primary focus:



```txt

.mp4

```



\### Unsupported but Detected



Files like `.mkv`, `.avi`, `.wmv` may not work reliably in the browser depending on codec.



The app should:



\* Detect them

\* Show them with a warning badge: `May not play in browser`

\* Do not crash

\* Allow the user to skip them



\---



\## 10. Course Folder Structure Example



Example selected folder:



```txt

Java Masterclass/

&#x20; 01 Introduction/

&#x20;   001 Welcome.mp4

&#x20;   002 Course Overview.mp3

&#x20; 02 Setup/

&#x20;   001 Install Java.mp4

&#x20;   002 Install IntelliJ.mp4

&#x20; 03 OOP/

&#x20;   001 Classes.mp4

&#x20;   002 Objects.mp4

&#x20;   Notes.pdf

```



The app should transform it into:



```txt

Course: Java Masterclass



Section 1: Introduction

&#x20; Lecture 1: Welcome

&#x20; Lecture 2: Course Overview



Section 2: Setup

&#x20; Lecture 1: Install Java

&#x20; Lecture 2: Install IntelliJ



Section 3: OOP

&#x20; Lecture 1: Classes

&#x20; Lecture 2: Objects

```



Non-media files should be ignored in MVP.



\---



\## 11. Main Layout



The UI should feel similar to a Udemy course lecture page.



\### Desktop Layout



```txt

┌──────────────────────────────────────────────────────────────┐

│ Top Bar                                                      │

├──────────────────────────────────────────────┬───────────────┤

│                                              │ Course Sidebar │

│ Main Media Area                              │               │

│ Video / Audio Player                         │ Sections      │

│                                              │ Lectures      │

│ Lecture title                                │ Progress      │

│ Notes / Metadata / Controls                  │ Search        │

│                                              │               │

└──────────────────────────────────────────────┴───────────────┘

```



Recommended dimensions:



```txt

Main content: 70%

Sidebar: 30%

Sidebar width: 360px to 420px

Top bar height: 56px to 64px

```



\### Mobile Layout



On mobile:



\* Media player appears first

\* Course content becomes a bottom drawer or collapsible panel

\* Sidebar can be opened with a `Course content` button

\* Lecture list must remain easy to scroll



\---



\## 12. Visual Design System



Use a polished clean design inspired by Udemy but with your own style.



\### Colors



Use these tokens:



```css

\--bg: #f5f7fb;

\--panel: #ffffff;

\--text: #121826;

\--muted: #637083;

\--line: #dbe2ef;

\--primary: #1f5eff;

\--primary-dark: #1646c2;

\--soft: #edf3ff;

\--success: #0c8f57;

\--danger: #c73535;

\--warning: #b7791f;

\--shadow: 0 16px 45px rgba(18, 24, 38, 0.08);

```



\### Typography



Use:



```css

font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

```



\### Borders



Use:



```css

border: 1px solid var(--line);

border-radius: 16px;

```



For main cards:



```css

border-radius: 22px;

```



For panels:



```css

border-radius: 24px;

```



\### Shadows



Use subtle shadows only for main panels:



```css

box-shadow: 0 16px 45px rgba(18, 24, 38, 0.08);

```



\### Udemy-Style Adjustments



The app should feel like a learning platform:



\* White main player area

\* Clean top navigation

\* Compact lecture list

\* Strong active lecture highlight

\* Small progress indicators

\* Section accordions

\* Course progress at the top of sidebar

\* Dark video player area

\* Light curriculum sidebar



\---



\## 13. App Pages



\### 13.1 Home / Empty State



When no folder is selected, show a centered onboarding screen.



Content:



```txt

CourseVault Player



Select a course folder from your computer.

Your files stay private. Nothing is uploaded.



\[Select Course Folder]

```



Also show:



```txt

Supported: MP3, MP4, WAV, M4A, WEBM

Progress is saved in your browser.

```



\### 13.2 Player Page



After selecting a folder, show the main player layout.



Main sections:



1\. Top bar

2\. Main media player

3\. Lecture information

4\. Course sidebar

5\. Footer controls



\---



\## 14. Main Features



\### Feature 1 — Select Folder



The user should click:



```txt

Select Course Folder

```



The browser opens a folder picker.



The app should:



1\. Read all files

2\. Filter media files

3\. Build folder tree

4\. Sort folders and files naturally

5\. Set first lecture as active

6\. Load saved progress from `localStorage`



Acceptance criteria:



\* User can select a folder

\* App detects media files inside subfolders

\* App ignores unsupported files

\* App shows course title based on root folder name

\* App does not upload files anywhere



\---



\### Feature 2 — Course Sidebar



Sidebar should show:



```txt

Course Content

Progress: 42%

17 / 40 completed



\[Search lectures...]



Section 1: Introduction

&#x20; ✓ 001 Welcome

&#x20; ◐ 002 Course Overview

&#x20; ○ 003 Setup



Section 2: Basics

&#x20; ○ 001 Variables

&#x20; ○ 002 Functions

```



Each section should be collapsible.



Each lecture row should show:



\* Status icon

\* Lecture title

\* Duration

\* Progress percentage

\* File type badge

\* Active state



Status icons:



```txt

○ Not started

◐ In progress

✓ Completed

▶ Currently playing

```



Lecture badges:



```txt

MP3

MP4

VIDEO

AUDIO

UNSUPPORTED

```



Acceptance criteria:



\* User can expand/collapse folders

\* Active lecture is highlighted

\* Completed lectures are visible

\* In-progress lectures show percentage

\* Search filters lectures without losing folder structure



\---



\### Feature 3 — Media Player



Use native HTML players:



For video:



```tsx

<video controls />

```



For audio:



```tsx

<audio controls />

```



The player should:



\* Load selected local file using `URL.createObjectURL(file)`

\* Show lecture title above or below player

\* Save progress while playing

\* Resume from last position

\* Auto-mark completed at 90%

\* Support next/previous lecture



Controls:



```txt

Previous

Next

Mark Complete

Restart

Playback speed

```



Playback speeds:



```txt

0.75x

1x

1.25x

1.5x

1.75x

2x

```



Acceptance criteria:



\* MP3 plays correctly

\* MP4 plays correctly

\* Current time saves automatically

\* Reloading the course restores progress

\* Next lecture starts when user clicks Next

\* Completed lecture remains completed after refresh



\---



\### Feature 4 — Progress Tracking



Progress should be saved in `localStorage`.



Save every:



```txt

5 seconds

on pause

on ended

before changing lecture

before page unload

```



Lecture progress data:



```ts

type LectureProgress = {

&#x20; lectureId: string;

&#x20; currentTime: number;

&#x20; duration: number;

&#x20; percent: number;

&#x20; completed: boolean;

&#x20; lastPlayedAt: string;

&#x20; playCount: number;

&#x20; manuallyCompleted?: boolean;

};

```



Course progress data:



```ts

type CourseProgress = {

&#x20; courseId: string;

&#x20; courseName: string;

&#x20; rootFolderName: string;

&#x20; totalLectures: number;

&#x20; completedLectures: number;

&#x20; lastLectureId: string | null;

&#x20; lastOpenedAt: string;

&#x20; lectures: Record<string, LectureProgress>;

};

```



localStorage key format:



```txt

coursevault:v1:progress

```



Recommended saved object:



```ts

type AppStorage = {

&#x20; version: 1;

&#x20; courses: Record<string, CourseProgress>;

&#x20; settings: AppSettings;

};

```



\---



\## 15. Lecture ID Strategy



The app needs stable IDs so progress remains connected to files.



Recommended lecture ID:



```ts

lectureId = hash(relativePath + file.size + file.lastModified)

```



Example:



```txt

01 Introduction/001 Welcome.mp4

size: 39201012

lastModified: 1710000000

```



This prevents progress conflicts when two files have the same name.



Course ID:



```ts

courseId = hash(rootFolderName + totalFiles + firstFileRelativePath)

```



For better future support, also store:



```ts

relativePath

fileName

fileSize

lastModified

```



\---



\## 16. Data Models



\### Media Type



```ts

type MediaType = "audio" | "video" | "unsupported";

```



\### Lecture



```ts

type Lecture = {

&#x20; id: string;

&#x20; title: string;

&#x20; fileName: string;

&#x20; relativePath: string;

&#x20; folderPath: string;

&#x20; extension: string;

&#x20; mediaType: MediaType;

&#x20; file: File;

&#x20; objectUrl?: string;

&#x20; size: number;

&#x20; lastModified: number;

&#x20; duration?: number;

&#x20; order: number;

};

```



\### Course Section



```ts

type CourseSection = {

&#x20; id: string;

&#x20; title: string;

&#x20; path: string;

&#x20; lectures: Lecture\[];

&#x20; children: CourseSection\[];

&#x20; isOpen: boolean;

};

```



\### Course



```ts

type Course = {

&#x20; id: string;

&#x20; name: string;

&#x20; rootFolderName: string;

&#x20; sections: CourseSection\[];

&#x20; lectures: Lecture\[];

&#x20; totalLectures: number;

&#x20; totalDuration?: number;

};

```



\### App Settings



```ts

type AppSettings = {

&#x20; sidebarPosition: "right" | "left";

&#x20; autoplayNext: boolean;

&#x20; autoMarkCompletedAt: number;

&#x20; defaultPlaybackRate: number;

&#x20; theme: "light" | "dark" | "system";

};

```



Default settings:



```ts

{

&#x20; sidebarPosition: "right",

&#x20; autoplayNext: false,

&#x20; autoMarkCompletedAt: 90,

&#x20; defaultPlaybackRate: 1,

&#x20; theme: "light"

}

```



\---



\## 17. Course Parsing Logic



When the user selects a folder:



1\. Read all files from input

2\. Get `webkitRelativePath`

3\. Filter media files

4\. Detect root folder

5\. Split paths by `/`

6\. Create folder tree

7\. Add lectures to correct section

8\. Sort naturally

9\. Build flat lecture list

10\. Load matching progress



Natural sorting example:



```txt

2 Lesson.mp4

10 Lesson.mp4

```



Should be sorted as:



```txt

2 Lesson.mp4

10 Lesson.mp4

```



Not:



```txt

10 Lesson.mp4

2 Lesson.mp4

```



Use:



```ts

localeCompare(value, undefined, { numeric: true, sensitivity: "base" })

```



\---



\## 18. Player Behavior



\### When User Opens Lecture



The app should:



1\. Save previous lecture progress

2\. Revoke old object URL

3\. Create object URL for new file

4\. Load media

5\. Seek to saved current time

6\. Apply saved playback speed

7\. Update active lecture

8\. Update sidebar active state



\### Resume Logic



If saved progress exists:



```txt

Resume from saved currentTime

```



But if lecture is completed:



```txt

Start near beginning unless user clicks Resume

```



Better UX:



Show small prompt:



```txt

You watched 94% of this lecture.

\[Resume] \[Start over]

```



\### Ended Logic



When media ends:



1\. Mark completed

2\. Save progress

3\. If autoplayNext is enabled, go to next lecture

4\. Else show next lesson card



\---



\## 19. Progress Rules



\### Not Started



```txt

percent = 0

currentTime = 0

completed = false

```



\### In Progress



```txt

percent > 0 \&\& percent < 90

completed = false

```



\### Completed



```txt

percent >= 90

```



or user manually clicks:



```txt

Mark Complete

```



\### Rewatching Completed Lecture



If user replays a completed lecture:



\* Keep completed status

\* Update currentTime

\* Increase playCount

\* Do not remove completion automatically



\---



\## 20. Search



Search input should filter:



\* Lecture title

\* File name

\* Folder name

\* Extension



Example:



```txt

Search: "install"

```



Should show:



```txt

02 Setup

&#x20; Install Node.mp4

&#x20; Install VSCode.mp4

```



Empty sections should be hidden during search.



\---



\## 21. Top Bar



Top bar should include:



Left:



```txt

CourseVault Player

```



Center or right:



```txt

Current Course Name

```



Actions:



```txt

Select New Folder

Export Progress

Import Progress

Settings

```



Optional:



```txt

Theme toggle

```



\---



\## 22. Main Player Content



Below the video/audio player, show:



```txt

Lecture title

Folder path

File type

Progress percentage

Duration

Last watched

```



Example:



```txt

001 Welcome to the Course



Section: 01 Introduction

Type: MP4 Video

Progress: 74%

Duration: 12:42

```



Add actions:



```txt

Previous Lecture

Next Lecture

Mark Complete

Restart Lecture

```



\---



\## 23. Notes Feature



MVP optional, but recommended.



Allow the user to write a note per lecture.



Data:



```ts

type LectureNote = {

&#x20; lectureId: string;

&#x20; content: string;

&#x20; updatedAt: string;

};

```



Stored inside localStorage.



UI:



```txt

My Notes

\[textarea]

Saved automatically

```



This makes the app much better for courses.



\---



\## 24. Export / Import Progress



\### Export



User clicks:



```txt

Export Progress

```



The app downloads:



```txt

coursevault-progress.json

```



Exported data:



```ts

AppStorage

```



\### Import



User selects JSON file.



The app validates:



\* Has version

\* Has courses object

\* Has valid lecture progress structure



Then merges or replaces progress.



Ask user:



```txt

Do you want to merge with current progress or replace everything?

```



For MVP, use merge.



\---



\## 25. Clear Data



Settings should include:



```txt

Clear Course Progress

Clear All Data

```



Use confirmation modal:



```txt

Are you sure? This will remove saved progress from this browser.

```



Never clear data without confirmation.



\---



\## 26. Settings Modal



Settings:



```txt

Playback

\- Autoplay next lecture

\- Default playback speed

\- Auto-complete threshold: 90%



Layout

\- Sidebar position: Right / Left

\- Compact sidebar mode



Data

\- Export progress

\- Import progress

\- Clear all data

```



\---



\## 27. Responsive Behavior



\### Desktop



```txt

Video main area + right sidebar

```



\### Tablet



```txt

Main player full width

Sidebar below or collapsible

```



\### Mobile



```txt

Top: player

Button: Course Content

Bottom drawer: lecture list

```



Mobile drawer should have:



\* Search

\* Progress summary

\* Section accordion

\* Close button



\---



\## 28. Accessibility



Requirements:



\* Buttons must be keyboard accessible

\* Active lecture should have `aria-current="true"`

\* Accordions should use `aria-expanded`

\* Video/audio should use native controls

\* Text contrast should be readable

\* Focus states should be visible

\* Icons should not be the only way to understand status



\---



\## 29. Error Handling



\### No Media Files Found



Show:



```txt

No playable course files found.



Supported files:

MP3, MP4, WAV, M4A, WEBM



Please select another folder.

```



\### Unsupported File



Show in sidebar:



```txt

Unsupported

```



Clicking it shows:



```txt

This file type may not be supported by your browser.

Try opening it in VLC or convert it to MP4/MP3.

```



\### Failed to Load Media



Show:



```txt

This media file could not be played.

The format or codec may not be supported by your browser.

```



\### localStorage Full



Show:



```txt

Progress could not be saved because browser storage is full.

Please export your progress or clear old data.

```



\---



\## 30. Recommended Component Structure



```txt

app/

&#x20; layout.tsx

&#x20; page.tsx

&#x20; globals.css



components/

&#x20; app-shell.tsx

&#x20; top-bar.tsx

&#x20; folder-picker.tsx

&#x20; media-player.tsx

&#x20; course-sidebar.tsx

&#x20; section-accordion.tsx

&#x20; lecture-row.tsx

&#x20; progress-bar.tsx

&#x20; settings-modal.tsx

&#x20; empty-state.tsx

&#x20; confirm-dialog.tsx



lib/

&#x20; course-parser.ts

&#x20; media-utils.ts

&#x20; storage.ts

&#x20; hash.ts

&#x20; progress.ts

&#x20; sort.ts



types/

&#x20; course.ts

&#x20; progress.ts

&#x20; settings.ts

```



\---



\## 31. State Management



Use Zustand or React state.



Recommended Zustand store:



```ts

type PlayerStore = {

&#x20; course: Course | null;

&#x20; activeLectureId: string | null;

&#x20; progress: AppStorage;

&#x20; searchQuery: string;

&#x20; settings: AppSettings;



&#x20; setCourse: (course: Course) => void;

&#x20; setActiveLecture: (lectureId: string) => void;

&#x20; updateLectureProgress: (lectureId: string, data: Partial<LectureProgress>) => void;

&#x20; markCompleted: (lectureId: string) => void;

&#x20; setSearchQuery: (query: string) => void;

&#x20; updateSettings: (settings: Partial<AppSettings>) => void;

};

```



\---



\## 32. localStorage Helpers



Create:



```ts

const STORAGE\_KEY = "coursevault:v1:progress";



export function loadStorage(): AppStorage;

export function saveStorage(data: AppStorage): void;

export function updateLectureProgress(courseId: string, lectureId: string, progress: Partial<LectureProgress>): void;

export function clearStorage(): void;

```



Important:



\* Wrap `localStorage` calls in `try/catch`

\* Validate JSON before using it

\* Use default data if storage is empty or corrupted



\---



\## 33. Acceptance Criteria



The MVP is complete when:



\* User can select a local course folder

\* App lists videos and MP3 files from all subfolders

\* Folder/subfolder structure is visible

\* Sections can expand and collapse

\* User can play MP3 files

\* User can play MP4 files

\* User can move next/previous

\* Progress saves automatically

\* Progress survives refresh after selecting the same folder again

\* Completed lectures show a completed state

\* In-progress lectures show progress percentage

\* Course progress summary is calculated

\* Search works

\* Export progress works

\* Import progress works

\* Clear data works

\* UI works on desktop

\* UI works on mobile

\* No backend is required

\* No files are uploaded

\* TypeScript has no major errors



\---



\## 34. Success Metrics



For personal use, success means:



```txt

User can open a course folder and start learning in less than 10 seconds.

```



Track internally:



\* Total lectures

\* Completed lectures

\* Course completion percentage

\* Last watched lecture

\* Last opened course

\* Watch progress per lecture



\---



\## 35. Future Improvements



After MVP, possible improvements:



1\. Electron or Tauri desktop app

2\. Persistent folder access using File System Access API + IndexedDB

3\. Subtitle support

4\. PDF/resources tab

5\. Notes per lecture

6\. Bookmarks inside videos

7\. Keyboard shortcuts

8\. Mini-player mode

9\. Dark mode

10\. Multiple course library

11\. Course cover image

12\. Import Udemy-like folder naming

13\. Auto-detect course sections

14\. Transcript panel

15\. AI summary of notes



\---



\## 36. Keyboard Shortcuts



Recommended shortcuts:



```txt

Space: Play / Pause

Arrow Right: Forward 10 seconds

Arrow Left: Back 10 seconds

N: Next lecture

P: Previous lecture

M: Mark complete

F: Fullscreen

S: Focus search

```



Show shortcuts in settings.



\---



\## 37. Final Product Behavior Example



User opens app.



The app shows:



```txt

Select a course folder

```



User selects:



```txt

Java Masterclass

```



The app scans:



```txt

43 media files found

6 sections detected

```



The sidebar shows:



```txt

Course Content

0 / 43 completed

0%



01 Introduction

&#x20; ○ Welcome.mp4

&#x20; ○ Course Overview.mp3



02 Setup

&#x20; ○ Install Java.mp4

&#x20; ○ Install IntelliJ.mp4

```



User plays `Welcome.mp4`.



After 5 minutes, progress saves.



User closes browser.



Next day, user opens app and selects the same folder.



The app shows:



```txt

Continue watching: Welcome.mp4

Progress: 38%

```



User clicks resume and continues.



\---



\## 38. First Implementation Plan



Build in this exact order:



1\. Create Next.js project

2\. Add Tailwind and lucide-react

3\. Create TypeScript types

4\. Create folder picker

5\. Parse files into lectures

6\. Build course tree

7\. Render sidebar

8\. Add video/audio player

9\. Add progress tracking

10\. Save progress to localStorage

11\. Add course progress summary

12\. Add search

13\. Add completed/manual controls

14\. Add export/import

15\. Add settings modal

16\. Polish responsive design

17\. Test with real MP3/MP4 course folders



\---



\## 39. Recommended MVP Name



Use:



```txt

CourseVault Player

```



Other possible names:



```txt

LocalCourse

StudyPlayer

CourseShelf

Offline Academy

LectureVault

```



Best one:



```txt

CourseVault Player

```



It sounds clean, private, and professional.



\---



\## 40. Developer Notes



Important technical details:



\* Do not upload files.

\* Do not store files in localStorage.

\* Store only metadata and progress.

\* Revoke object URLs when switching files.

\* Use stable IDs from path + size + lastModified.

\* Use natural sorting.

\* Save progress often, but not on every second.

\* Use client components because folder access and localStorage need the browser.

\* Keep the first version simple and reliable.



\---



\## 41. Final Summary



CourseVault Player is a private Udemy-style local media player for downloaded courses.



The MVP should focus on:



```txt

Folder selection

Course tree

Video/audio playback

Progress tracking

Clean sidebar

Resume learning

localStorage persistence

```



The app should feel polished, fast, and private.



