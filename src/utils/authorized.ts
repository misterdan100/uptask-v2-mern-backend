export const isAuthorized = (managerId: string, userId: string) => {
    return managerId.toString() === userId.toString()
}