

export const filterByTab = (todos, activeTab) => {

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  switch (activeTab) {
    case "pending":
      return todos.filter(t => !t.done)

    case "completed":
      return todos.filter(t => t.done)

    case "today":
      return todos.filter(t => {
        const d = new Date(t.date)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === todayTime
      })

    case "high-priority":
      return todos.filter(t => t.priority === "high")

    default:
      return todos
  }
}

export const searchTasks = (todos, searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) return todos

    const q = searchQuery.toLowerCase()

    return todos.filter(
        (t) =>
            t.title.toLowerCase().includes(q) ||
            t.desc?.toLowerCase().includes(q) ||
            t.tags?.some((tag) => tag.toLowerCase().includes(q)),
    )
}

export const sortTasks = (todos, sortBy) => {
    const list = [...todos]

    switch (sortBy) {
        case "date-asc":
            return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

        case "date-desc":
            return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        case "priority-low":
            return list.sort((a, b) => a.priorityRank - b.priorityRank)

        case "priority-high":
            return list.sort((a, b) => b.priorityRank - a.priorityRank)

        case "starred":
            return list.sort((a, b) => Number(b.starred) - Number(a.starred))

        case "deadline":
            return list.sort((a, b) => {
                if (!a.deadline && !b.deadline) return 0
                if (!a.deadline) return 1
                if (!b.deadline) return -1
                return new Date(a.deadline) - new Date(b.deadline)
            })

        case "deadline-latest":
            return list.sort((a, b) => {
                if (!a.deadline && !b.deadline) return 0
                if (!a.deadline) return 1
                if (!b.deadline) return -1
                return new Date(b.deadline) - new Date(a.deadline)
            })

        default:
            return list
    }
}

export const limitTasks = (todos, limit) => {
    if (!limit || limit <= 0) return todos
    return todos.slice(0, limit)
}


export const processTasks = ({ todos, activeTab, searchQuery, sortLabel, limit }) => {

    console.log(`Inside processTasks-- activeTab--> ${activeTab}, searchQuery--> ${searchQuery}, sortLabel--> ${sortLabel}, limit--> ${limit}`)
    console.log("todos--->", todos)

    return limitTasks(sortTasks(searchTasks(filterByTab(todos, activeTab), searchQuery), sortLabel), limit)

}

