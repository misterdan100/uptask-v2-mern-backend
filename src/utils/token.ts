// Generate a 6 digits token number
export const generateToken = () => Math.floor(10000 + Math.random() * 900000).toString()