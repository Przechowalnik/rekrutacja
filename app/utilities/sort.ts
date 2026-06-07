import dayjs from "dayjs";

type T_SortArray<T> = {
  array: T[];
  path?: keyof T;
  sort?: "ASC" | "DESC";
};

export const sortArray = <T>({
  array = [],
  path,
  sort = "DESC",
}: T_SortArray<T>) => {
  const newArray = [...array];
  newArray?.sort((a, b) => {
    const firstItemToSort = path ? a?.[path] : a;
    const secondItemToSort = path ? b?.[path] : b;
    if (firstItemToSort && secondItemToSort) {
      if (firstItemToSort < secondItemToSort) {
        return sort === "ASC" ? -1 : 1;
      } else if (firstItemToSort > secondItemToSort) {
        return sort === "ASC" ? 1 : -1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  });

  return newArray;
};

export const sortArrayFromDate = <T>({
  array = [],
  path,
  sort = "DESC",
}: T_SortArray<T>) => {
  const newArray = [...array];
  newArray?.sort((a, b) => {
    const firstItemToSort = path
      ? dayjs(a?.[path] as string)
      : dayjs(a as string);
    const secondItemToSort = path
      ? dayjs(b?.[path] as string)
      : dayjs(b as string);
    if (firstItemToSort && secondItemToSort) {
      if (firstItemToSort < secondItemToSort) {
        return sort === "ASC" ? -1 : 1;
      } else if (firstItemToSort > secondItemToSort) {
        return sort === "ASC" ? 1 : -1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  });

  return newArray;
};
