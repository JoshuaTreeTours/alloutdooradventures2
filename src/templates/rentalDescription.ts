const getEquipmentName = (value: string) =>
  value
    .replace(/\b(rental|rentals|hire|self-guided)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

export const buildRentalDescription = ({
  equipment,
  city,
  location,
}: {
  equipment: string;
  city: string;
  location: string;
}) => {
  const cleanedEquipment = getEquipmentName(equipment) || "equipment";

  return `${cleanedEquipment} is a self-guided equipment rental in ${city}, ${location}. This equipment rental includes flexible duration options, clear pickup details, and rental terms so you can explore at your own pace.`;
};
