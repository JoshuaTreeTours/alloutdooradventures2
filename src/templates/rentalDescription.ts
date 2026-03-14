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

  return `${cleanedEquipment} is a self-guided equipment rental in ${city}, ${location}. This equipment rental includes flexible duration options, a clear pickup location, and time to explore at your own pace.`;
};
