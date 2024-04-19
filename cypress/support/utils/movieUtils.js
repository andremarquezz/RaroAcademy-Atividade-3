export const isWithinOneMinuteDifference = (updatedAtString) => {
  const maxTimeDifference = 60000;

  const updatedAtDate = new Date(updatedAtString);
  const currentDate = new Date();
  const timeDifference = Math.abs(
    updatedAtDate.getTime() - currentDate.getTime()
  );

  return timeDifference <= maxTimeDifference;
};
