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

  return `Book ${cleanedEquipment} rental in ${city}, ${location}. This self-guided equipment rental includes flexible duration options, easy pickup logistics, and time to explore at your own pace.`;
};
