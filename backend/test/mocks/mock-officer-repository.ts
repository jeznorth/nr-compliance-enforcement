const collection = [
  { officer_guid: "eb27498b-4d7f-4873-98ce-4ddafa65c4b7", user_id: "JPERALTA", auth_user_guid: null, office_guid: { office_guid: "5128179c-f622-499b-b8e5-b39199081f22", cos_geo_org_unit: { zone_code: "NCHKOLKS", region_code: "OMINECA", region_name: "Omineca", zone_name: "Nechako-Lakes", office_location_code: "VNDHF", office_location_name: "Vanderhoof", area_code: "PORTAGER", area_name: "Portage Reserve", }, }, person_guid: { person_guid: "18773a32-c737-4fb5-9020-a5da550f06ed", first_name: "Jake", middle_name_1: null, middle_name_2: null, last_name: "Peralta", }, },
  { officer_guid: "e3898d0e-8152-43df-9c71-8b173158dcaf", user_id: "TRIDDLE", auth_user_guid: null, office_guid: { office_guid: "5c7023b9-710e-4333-bbcb-8a95350b747c", cos_geo_org_unit: { zone_code: "BLKYCSR", region_code: "SKNA", region_name: "Skeena", zone_name: "Bulkley-Cassiar", office_location_code: "ATLIN", office_location_name: "Atlin", area_code: "PLSNTCMP", area_name: "Pleasant Camp", }, }, person_guid: { person_guid: "49418234-75fb-45c2-9ad4-b1c2394f3c51", first_name: "Tom", middle_name_1: null, middle_name_2: null, last_name: "Riddle", }, },
  { officer_guid: "65dbad8b-790a-43cb-b394-c8019f4c86e2", user_id: "M2SEARS", auth_user_guid: "a6620175-84d0-436b-b13e-d97457d69588", office_guid: { office_guid: "db343458-8eca-42c2-91ec-070b3e6de663", cos_geo_org_unit: { zone_code: "CRBOTMPSN", region_code: "TMPSNCRBO", region_name: "Thompson Cariboo", zone_name: "Cariboo Thompson", office_location_code: "100MLHSE", office_location_name: "100 Mile House", area_code: "BIGBRLK", area_name: "Big Bar Lake", }, }, person_guid: { person_guid: "5b9bcbf6-73b4-4b56-8fc3-d979bb3c1ff7", first_name: "Mike", middle_name_1: null, middle_name_2: null, last_name: "Sears", }, },
  { officer_guid: "84ac75b9-c584-4f55-a70c-6fa35c8efde4", user_id: "TSPRADO", auth_user_guid: null, office_guid: { office_guid: "b494082e-35a3-468f-8955-4aa002066b36", cos_geo_org_unit: { zone_code: "SOKNGN", region_code: "OKNGN", region_name: "Okanagan", zone_name: "South Okanagan", office_location_code: "PNTCTN", office_location_name: "Penticton", area_code: "PENTICTN", area_name: "Penticton", }, }, person_guid: { person_guid: "7de151c1-ae52-41c3-834d-d538bbb50cda", first_name: "Tobe", middle_name_1: null, middle_name_2: null, last_name: "Sprado", }, },
  { officer_guid: "fc91b041-7f1b-46e9-8c07-0813bb656a7f", user_id: "ENCETST1", auth_user_guid: "0cf857a2-28a3-4867-af0f-d59449243057", office_guid: { office_guid: "79fe321b-7716-413f-b878-c5fd6100317d", cos_geo_org_unit: { zone_code: "CRBOTMPSN", region_code: "TMPSNCRBO", region_name: "Thompson Cariboo", zone_name: "Cariboo Thompson", office_location_code: "CLRWTER", office_location_name: "Clearwater", area_code: "BLKPL", area_name: "Black Pool", }, }, person_guid: { person_guid: "16dc87d5-2034-4d9a-bbf4-3ec0f927d3e8", first_name: "ENV", middle_name_1: null, middle_name_2: null, last_name: "TestAcct", }, },
  { officer_guid: "7c4ad99d-0518-4a83-b12d-984d7c25beeb", user_id: "CWIGGUM", auth_user_guid: null, office_guid: { office_guid: "3a4e8fc8-db72-4f02-b5ee-1f257c74a635", cos_geo_org_unit: { zone_code: "OMNCA", region_code: "OMINECA", region_name: "Omineca", zone_name: "Omineca", office_location_code: "MKNZI", office_location_name: "Mackenzie", area_code: "POWDERKG", area_name: "Powder King", }, }, person_guid: { person_guid: "21ff3519-a725-4dfe-91a3-26850c5aafad", first_name: "Clancy", middle_name_1: null, middle_name_2: null, last_name: "Wiggum", }, },
  { officer_guid: "9d171865-aab6-43d1-bbf2-93b4d4c5ba02", user_id: "AWILCOX", auth_user_guid: "287d4e72-8409-4dd1-991a-8b1117b8eb2a", office_guid: { office_guid: "9fc7327b-b206-4a5c-88f1-2875a456eb49", cos_geo_org_unit: { zone_code: "CRBOCHLCTN", region_code: "TMPSNCRBO", region_name: "Thompson Cariboo", zone_name: "Cariboo Chilcotin", office_location_code: "WLMSLK", office_location_name: "Williams Lake", area_code: "140MHHS", area_name: "140 Mile House", }, }, person_guid: { person_guid: "666c0f30-d707-4ade-b67f-9b888fe234e6", first_name: "Alec", middle_name_1: null, middle_name_2: null, last_name: "Wilcox", }, },
  { officer_guid: "3eac2028-9e13-4a7f-af07-f0b8264f32c4", user_id: "VYATES", auth_user_guid: null, office_guid: { office_guid: "3f474308-68da-450a-b1ab-fb8a5b7a27ce", cos_geo_org_unit: { zone_code: "OMNCA", region_code: "OMINECA", region_name: "Omineca", zone_name: "Omineca", office_location_code: "PRCG", office_location_name: "Prince George", area_code: "DOMECRK", area_name: "Dome Creek/Cresent Spur", }, }, person_guid: { person_guid: "8743b973-1945-4227-9402-eacb167889b9", first_name: "Vita", middle_name_1: null, middle_name_2: null, last_name: "Yates", },},
 ];
 
 const single = (idx: number = 0) => {
  return collection[idx];
 };

export const MockOfficerRepository = () => ({
  findAll: jest.fn().mockReturnThis(),
  findByOffice: jest.fn().mockReturnThis(),
  findByAuthUserGuid: jest.fn().mockReturnThis(),
  findByUserId: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockResolvedValue(single(2)),
  update: jest.fn().mockReturnThis(),
  remove: jest.fn().mockReturnThis(),
  find: jest.fn().mockResolvedValue(single(6)),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    distinctOn: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(collection),
  })),
});