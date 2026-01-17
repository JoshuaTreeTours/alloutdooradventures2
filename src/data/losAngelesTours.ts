import { slugify } from "./tourCatalog";
import type { Tour } from "./tours.types";

type LosAngelesSourceTour = {
  company: string;
  shortname: string;
  itemId: string;
  title: string;
  tags: string;
  image: string;
  bookingUrl: string;
  bookingWidgetUrl: string;
};

const LOS_ANGELES_SOURCE_TOURS: LosAngelesSourceTour[] = [
  {
    company: "Hollywood Bus Tours, LLC",
    shortname: "hollywoodbustoursla",
    itemId: "333382",
    title: "A Taste of LA: Half Day Tour of the BEST of Los Angeles",
    tags: "City Tour-Museum-Sightseeing Tour",
    image: "https://cdn.filestackcontent.com/T5WYAXrVScjR4SNHb0BD",
    bookingUrl:
      "https://fareharbor.com/embeds/book/hollywoodbustoursla/items/333382/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/hollywoodbustoursla/items/333382/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Golden Ticket LA",
    shortname: "alldayla",
    itemId: "205984",
    title: "1 Hr - Real Hollywood Sign Tour",
    tags: "Sightseeing Tour",
    image: "https://cdn.filestackcontent.com/s4urjGMMSEObSWnyZ5E4",
    bookingUrl:
      "https://fareharbor.com/embeds/book/alldayla/items/205984/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/alldayla/items/205984/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Unlimited Biking",
    shortname: "unlimitedbiking",
    itemId: "394572",
    title: "Santa Monica & Venice Beach eBike Tour",
    tags: "Attraction-Bike Tour-E-Bike-Marina-Photography Tour-Sightseeing Tour",
    image: "https://cdn.filestackcontent.com/yB81A1USTWy88t1OtaEb",
    bookingUrl:
      "https://fareharbor.com/embeds/book/unlimitedbiking/items/394572/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/unlimitedbiking/items/394572/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Golden Ticket LA",
    shortname: "alldayla",
    itemId: "168579",
    title: "LA Essential Star Homes Tour",
    tags: "Sightseeing Tour",
    image: "https://cdn.filestackcontent.com/JwJyljguTkKDCCITcTMe",
    bookingUrl:
      "https://fareharbor.com/embeds/book/alldayla/items/168579/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/alldayla/items/168579/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Parlor Car Tours",
    shortname: "parlorcartours",
    itemId: "495929",
    title: "Hollywood Sightseeing Trolley Tour",
    tags: "Bus Tour-Sightseeing Tour",
    image: "https://cdn.filestackcontent.com/Md0xFxXARTGbe5OsbTck",
    bookingUrl:
      "https://fareharbor.com/embeds/book/parlorcartours/items/495929/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/parlorcartours/items/495929/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Golden Ticket LA",
    shortname: "alldayla",
    itemId: "518084",
    title: "Private Los Angeles Tour (Beverly Hills)",
    tags: "City Tour-Private-Sightseeing Tour",
    image: "https://cdn.filestackcontent.com/8b9pyGF6QB0UiK7Yoc2y",
    bookingUrl:
      "https://fareharbor.com/embeds/book/alldayla/items/518084/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/alldayla/items/518084/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Explor Oaxaca",
    shortname: "exploroax",
    itemId: "647496",
    title: "Hierve el agua + mole & Mezcal tasting",
    tags: "Guided Tour-Hiking",
    image: "https://cdn.filestackcontent.com/d5a6UnqFRGq7rPaypKrL",
    bookingUrl:
      "https://fareharbor.com/embeds/book/exploroax/items/647496/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/exploroax/items/647496/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Grave Line Tours",
    shortname: "graveline",
    itemId: "680527",
    title: "Manson Family Murders Funeral Limo Tour of LA",
    tags: "City Tour-Ghost Tour-Guided Tour-History Tour-Sightseeing Tour",
    image: "https://cdn.filestackcontent.com/mehLbyeBRDmhWg9xAAlG",
    bookingUrl:
      "https://fareharbor.com/embeds/book/graveline/items/680527/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/graveline/items/680527/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Explor Oaxaca",
    shortname: "exploroax",
    itemId: "647470",
    title: "Apoala Hike + Swimming",
    tags: "Guided Tour-Hiking",
    image: "https://cdn.filestackcontent.com/Y2g5PX6IRiiKfcMOMsTm",
    bookingUrl:
      "https://fareharbor.com/embeds/book/exploroax/items/647470/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/exploroax/items/647470/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Jolly Sailing",
    shortname: "jollysailinglb",
    itemId: "187968",
    title: "Two-Hour Private Charter",
    tags: "Sailing",
    image: "https://cdn.filestackcontent.com/eyhpgns4TBK8yvGSckpY",
    bookingUrl:
      "https://fareharbor.com/embeds/book/jollysailinglb/items/187968/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/jollysailinglb/items/187968/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Explor Oaxaca",
    shortname: "exploroax",
    itemId: "647351",
    title: "Hike + Hot Chocolate",
    tags: "Guided Tour-Hiking",
    image: "https://cdn.filestackcontent.com/fFkONkGaQCW8Trpz4ysA",
    bookingUrl:
      "https://fareharbor.com/embeds/book/exploroax/items/647351/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/exploroax/items/647351/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Hollywood Hikes, LLC",
    shortname: "hollywoodhikes",
    itemId: "471721",
    title: "The Official Hollywood Sign Walking Tour in Los Angeles-Free Waters!",
    tags: "Walking Tour",
    image: "https://cdn.filestackcontent.com/L7s2PXn7TyLI9DkUDV7g",
    bookingUrl:
      "https://fareharbor.com/embeds/book/hollywoodhikes/items/471721/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/hollywoodhikes/items/471721/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Hollywood Hikes, LLC",
    shortname: "hollywoodhikes",
    itemId: "471726",
    title:
      "The Official Hollywood Sign Express Walking Tour in Los Angeles-Free Waters!",
    tags: "Walking Tour",
    image: "https://cdn.filestackcontent.com/jL1Pe9qMQF67SxBKhFNR",
    bookingUrl:
      "https://fareharbor.com/embeds/book/hollywoodhikes/items/471726/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/hollywoodhikes/items/471726/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Explor Oaxaca",
    shortname: "exploroax",
    itemId: "647492",
    title: "Hike to Breathtaking views",
    tags: "Guided Tour-Hiking",
    image: "https://cdn.filestackcontent.com/KHuXUusQKyoGIJy1FIBI",
    bookingUrl:
      "https://fareharbor.com/embeds/book/exploroax/items/647492/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/exploroax/items/647492/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Take Me Out LA",
    shortname: "takemeoutla",
    itemId: "629071",
    title: "Venice’s Finest: A Daytime Experience",
    tags: "Walking Tour",
    image: "https://cdn.filestackcontent.com/xxTGErtvSvidZOPPQrkP",
    bookingUrl:
      "https://fareharbor.com/embeds/book/takemeoutla/items/629071/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/takemeoutla/items/629071/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Bowery Boys Walks",
    shortname: "boweryboyswalks",
    itemId: "336636",
    title: "Christmas in Old New York WALKING TOUR",
    tags: "City Tour-Walking Tour",
    image: "https://cdn.filestackcontent.com/vVwextyRICCDig20a5Ug",
    bookingUrl:
      "https://fareharbor.com/embeds/book/boweryboyswalks/items/336636/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/boweryboyswalks/items/336636/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Hollywood LA Tours",
    shortname: "hollywooddreamtours",
    itemId: "349518",
    title: "Sightseeing Hollywood Tours",
    tags: "Sightseeing Tour",
    image: "",
    bookingUrl:
      "https://fareharbor.com/embeds/book/hollywooddreamtours/items/349518/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/hollywooddreamtours/items/349518/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Jolly Sailing",
    shortname: "jollysailinglb",
    itemId: "262585",
    title: "Three-Hour Private Charter",
    tags: "Sailing",
    image: "https://cdn.filestackcontent.com/ONhja9plTeui0gXLgyQw",
    bookingUrl:
      "https://fareharbor.com/embeds/book/jollysailinglb/items/262585/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/jollysailinglb/items/262585/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Walk and Ride Hollywood",
    shortname: "walkandridetours",
    itemId: "547525",
    title: "1-Hour Walk of Fame Guided Tour",
    tags: "Walking Tour",
    image: "https://cdn.filestackcontent.com/nOED5MVjRYhdCqre6IVt",
    bookingUrl:
      "https://fareharbor.com/embeds/book/walkandridetours/items/547525/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/walkandridetours/items/547525/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Grave Line Tours",
    shortname: "graveline",
    itemId: "680528",
    title: "Death Becomes Her Funeral Limo Tour of Los Angeles",
    tags: "City Tour-Ghost Tour-Guided Tour-History Tour-Sightseeing Tour",
    image: "https://cdn.filestackcontent.com/4tVjDoPQt2rowJhpeefs",
    bookingUrl:
      "https://fareharbor.com/embeds/book/graveline/items/680528/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/graveline/items/680528/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Grave Line Tours",
    shortname: "graveline",
    itemId: "680529",
    title: "Hollywood Horror Story: The Black Dahlia Funeral Limo Tour",
    tags: "City Tour-Ghost Tour-Guided Tour-History Tour-Sightseeing Tour",
    image: "https://cdn.filestackcontent.com/CWNoiwruT76kvMxjomkh",
    bookingUrl:
      "https://fareharbor.com/embeds/book/graveline/items/680529/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/graveline/items/680529/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Hollywood LA Tours",
    shortname: "hollywooddreamtours",
    itemId: "148087",
    title: "Vegas to Hollywood tour",
    tags: "Walking Tour",
    image: "https://cdn.filestackcontent.com/keEmPGUdQVymh6H8ILyz",
    bookingUrl:
      "https://fareharbor.com/embeds/book/hollywooddreamtours/items/148087/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/hollywooddreamtours/items/148087/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Alaska Paddle Expeditions",
    shortname: "alaskapaddleexpeditions",
    itemId: "643023",
    title: "The Kingfisher's Corridor Cruise",
    tags: "Boat Tour-Guided Tour-Kayak-Rafting",
    image: "https://cdn.filestackcontent.com/7iMN4lMcTx69cobPfOij",
    bookingUrl:
      "https://fareharbor.com/embeds/book/alaskapaddleexpeditions/items/643023/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/alaskapaddleexpeditions/items/643023/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Sunset Exotic Tour",
    shortname: "sunsetexotictour",
    itemId: "324799",
    title: "Beverly Hills Tour 1h15 minutes",
    tags: "City Tour-Factory Tour-Photography Tour-Sightseeing Tour-Theater",
    image: "https://cdn.filestackcontent.com/A5HYYN3KRu3fM4sGixJg",
    bookingUrl:
      "https://fareharbor.com/embeds/book/sunsetexotictour/items/324799/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/sunsetexotictour/items/324799/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Blue Pacific Yachting",
    shortname: "bluepacificboating",
    itemId: "176246",
    title: "Beginning Sailing • ASA 101",
    tags: "Sailing",
    image: "https://cdn.filestackcontent.com/gym2L5FqTBGm8KdjDOdY",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bluepacificboating/items/176246/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bluepacificboating/items/176246/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Blue Pacific Yachting",
    shortname: "bluepacificboating",
    itemId: "176495",
    title: "Private ASA 103 Class",
    tags: "Sailing",
    image: "https://cdn.filestackcontent.com/LYSeQfg1RUOc0fuG2kmB",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bluepacificboating/items/176495/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bluepacificboating/items/176495/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Blue Pacific Yachting",
    shortname: "bluepacificboating",
    itemId: "176503",
    title: "Private ASA 114 Class",
    tags: "Sailing",
    image: "https://cdn.filestackcontent.com/5f39qZYORkiziUXKq4iS",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bluepacificboating/items/176503/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bluepacificboating/items/176503/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Blue Pacific Yachting",
    shortname: "bluepacificboating",
    itemId: "176508",
    title: "Private ASA 118 Class",
    tags: "Sailing",
    image: "https://cdn.filestackcontent.com/rdpra1N2Sw6lM2I0r4nH",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bluepacificboating/items/176508/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bluepacificboating/items/176508/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Sunset Exotic Tour",
    shortname: "sunsetexotictour",
    itemId: "382848",
    title: "The Beach Tour 4 Hours",
    tags: "Attraction-Exotic Car-Sightseeing Tour",
    image: "https://cdn.filestackcontent.com/PINfVSoeSmcZfeHnz5EA",
    bookingUrl:
      "https://fareharbor.com/embeds/book/sunsetexotictour/items/382848/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/sunsetexotictour/items/382848/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
  {
    company: "Blue Pacific Yachting",
    shortname: "bluepacificboating",
    itemId: "176251",
    title: "Beginning/Intermediate Sailing • ASA 101/103",
    tags: "Sailing",
    image: "https://cdn.filestackcontent.com/uq4GF13vROSFqkp5RPKj",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bluepacificboating/items/176251/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bluepacificboating/items/176251/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
  },
];

const splitTags = (tagList: string) =>
  tagList
    .split("-")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const losAngelesTours: Tour[] = LOS_ANGELES_SOURCE_TOURS.map((tour) => {
  const tags = splitTags(tour.tags ?? "");
  const categories = tags.map((tag) => slugify(tag));
  const shortDescription = tags.slice(0, 2).join(" · ");
  const heroImage = tour.image || "/hero.jpg";

  return {
    id: `${tour.shortname}-${tour.itemId}`,
    slug: slugify(`${tour.title}-${tour.itemId}`),
    title: tour.title,
    shortDescription: shortDescription || undefined,
    operator: tour.company,
    categories: categories.length ? categories : undefined,
    primaryCategory: categories[0],
    tags: tags.length ? tags : undefined,
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
    },
    heroImage,
    galleryImages: [heroImage],
    badges: {
      tagline: tags[0] ?? "Guided tour",
    },
    tagPills: tags.length ? tags : undefined,
    activitySlugs: categories.length ? categories : ["adventure"],
    bookingProvider: "fareharbor",
    bookingUrl: tour.bookingUrl,
    bookingWidgetUrl: tour.bookingWidgetUrl,
    longDescription: `${tour.title} is a guided experience based in Los Angeles, California that keeps the focus on the local highlights and an easy-to-book schedule.`,
  };
});

export const getLosAngelesTourSlug = (tour: Tour) =>
  tour.slug?.trim() ? tour.slug : slugify(`${tour.title}-los-angeles`);

const getLosAngelesTourSlugCandidates = (tour: Tour) => {
  const baseSlug = getLosAngelesTourSlug(tour);
  const titleSlug = slugify(tour.title);
  const titleCitySlug = slugify(`${tour.title}-los-angeles`);

  return Array.from(new Set([baseSlug, titleSlug, titleCitySlug].filter(Boolean)));
};

export const getLosAngelesTourBySlug = (slug: string) =>
  losAngelesTours.find((tour) =>
    getLosAngelesTourSlugCandidates(tour).includes(slug),
  );

export const getLosAngelesTourDetailPath = (tour: Tour) =>
  `/tours/los-angeles/${getLosAngelesTourSlug(tour)}`;

export const getLosAngelesTourBookingPath = (tour: Tour) =>
  `/tours/los-angeles/${getLosAngelesTourSlug(tour)}/book`;
