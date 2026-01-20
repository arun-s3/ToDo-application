
export const sortMap = {
  "createdAt:-1": "date-desc",
  "createdAt:1": "date-asc",
  "priority:-1": "priority-high",
  "priority:1": "priority-low",
  "starred:-1": "starred",
  "deadline:1": "deadline",
  "deadline:-1": "deadline-latest",
}

export const mapSortAndSortByToSortLabel = (value, sort) => {
    return sortMap[`${value}:${sort}`] || null
}
