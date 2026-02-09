export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs === 0) {
    return [mins, secs]
      .map((v) => v.toString().padStart(2, "0"))
      .join(":");
  }

  return [hrs, mins, secs].map((v) => v.toString().padStart(2, "0")).join(":");
};

export const toggleArrayItem = <T,>(
  item: T,
  array: T[],
  setter: React.Dispatch<React.SetStateAction<T[]>>
) => {
  if (array.includes(item)) {
    setter(array.filter((i) => i !== item));
  } else {
    setter([...array, item]);
  }
};

export const getVideoUrl = (path: string, bucketUrl: string): string => {
  return `${bucketUrl}/${path}`;
};

export const getImageUrl = (path: string | null, bucketUrl: string, fallback: string = "https://placehold.co/400x200?text=No+Image"): string => {
  if (!path) return fallback;
  return `${bucketUrl}/${path}`;
};
