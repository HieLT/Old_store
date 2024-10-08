// Vietnamese kids' heights (centimeter)
const validateHeight = (height: number): boolean => {
    return height > 46 && height <=160
};

export default validateHeight;