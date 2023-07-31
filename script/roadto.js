const fs = require('fs');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const FILENAME = 'script/roadto.json';
const GRAPHQL_ENDPOINT = 'https://cmqivfcisjb3viqolzsggmd3ea.appsync-api.eu-west-1.amazonaws.com/graphql';
const BUDAPEST_ID = '7138987';
const GetChampionshipQualifications = `query GetChampionshipQualifications($competitionId: Int!, $eventId: Int, $country: String, $qualificationType: String) {
  getChampionshipQualifications(competitionId: $competitionId, eventId: $eventId, country: $country, qualificationType: $qualificationType) {
    eventId
    groupByCountry
    entryNumber
    entryStandard
    alternativeEntryStandards {
      entryStandard
      event
      __typename
    }
    disciplineName
    maxCompetitorsByCoutnry
    firstQualificationDay
    lastQualificationDay
    firstRankingDay
    lastRankingDay
    rankDate
    numberOfCompetitorsQualifiedByEntryStandard
    numberOfCompetitorsQualifiedByTopList
    numberOfCompetitorsFilledUpByWorldRankings
    numberOfCompetitorsQualifiedByUniversalityPlaces
    numberOfCompetitorsQualifiedByDesignatedCompetition
    qualifications {
      qualifiedBy
      qualified
      qualificationPosition
      countryPosition
      name
      urlSlug
      iaafId
      birthDate
      competitorIaafId
      result
      wind
      venue
      date
      countryCode
      place
      score
      calculationId
      label
      __typename
    }
    events {
      genderCode
      eventId
      disciplineName
      __typename
    }
    countries {
      shortname
      name
      __typename
    }
    qualificationTypes {
      id
      name
      __typename
    }
    __typename
  }
}`;
const headers = {
  'content-type': 'application/json',
  'x-api-key': 'da2-yhjrcquonnb3bncekqi5j2pggy',
};
// Object.fromEntries([...document.querySelectorAll('#eventId option')].map(e => [e.innerText, e.value]))
const events = {
  "Women's 100m": '10229509',
  "Women's 200m": '10229510',
  "Women's 400m": '10229511',
  "Women's 800m": '10229512',
  "Women's 1500m": '10229513',
  "Women's 5000m": '10229514',
  "Women's 10,000m": '10229521',
  "Women's 100mH": '10229522',
  "Women's 400mH": '10229523',
  "Women's 3000mSC": '10229524',
  "Women's High Jump": '10229526',
  "Women's Pole Vault": '10229527',
  "Women's Long Jump": '10229528',
  "Women's Triple Jump": '10229529',
  "Women's Shot Put": '10229530',
  "Women's Discus Throw": '10229531',
  "Women's Hammer Throw": '10229532',
  "Women's Javelin Throw": '10229533',
  "Women's Marathon": '10229534',
  "Women's 20km Race Walk": '10229535',
  "Women's 35km Race Walk": '10229989',
  "Women's Heptathlon": '10229536',
  "Women's 4x100m": '204594',
  "Women's 4x400m": '204596',
  "Men's 100m": '10229630',
  "Men's 200m": '10229605',
  "Men's 400m": '10229631',
  "Men's 800m": '10229501',
  "Men's 1500m": '10229502',
  "Men's 5000m": '10229609',
  "Men's 10,000m": '10229610',
  "Men's 110mH": '10229611',
  "Men's 400mH": '10229612',
  "Men's 3000mSC": '10229614',
  "Men's High Jump": '10229615',
  "Men's Pole Vault": '10229616',
  "Men's Long Jump": '10229617',
  "Men's Triple Jump": '10229618',
  "Men's Shot Put": '10229619',
  "Men's Discus Throw": '10229620',
  "Men's Hammer Throw": '10229621',
  "Men's Javelin Throw": '10229636',
  "Men's Marathon": '10229634',
  "Men's 20km Race Walk": '10229508',
  "Men's 35km Race Walk": '10229627',
  "Men's Decathlon": '10229629',
  "Men's 4x100m": '204593',
  "Men's 4x400m": '204595',
  'Mixed 4x400m': '10229988',
};
const commonDisciplines = [
  '60 Metres',
  '100 Metres',
  '200 Metres',
  '400 Metres',
  '600 Metres',
  '800 Metres',
  '1500 Metres',
  'One Mile',
  '3000 Metres',
  'Two Miles',
  '5000 Metres',
  '10,000 Metres',
  'Half Marathon',
  'Marathon',
  '3000 Metres Steeplechase',
  '60 Metres Hurdles',
  '100 Metres Hurdles',
  '110 Metres Hurdles',
  '400 Metres Hurdles',
];

(async () => {
  for (const temperature of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]) {
  if (fs.existsSync(`script/roadto_${temperature}.json`)) continue;
  const previews = {}; // JSON.parse(fs.readFileSync(FILENAME, 'utf-8'));
  for (const discipline of commonDisciplines) {
    for (const gender of ['Men', 'Women']) {
      const genderedEvt = `${gender}'s ${discipline.replace(' Metres', 'm').replace(' Hurdles', 'H').replace(' Steeplechase', 'SC')}`;
      if (previews[genderedEvt]) continue;
      const eventId = events[genderedEvt];
      if (eventId) {
        console.log(genderedEvt);
        const { data } = await (
          await fetch(GRAPHQL_ENDPOINT, {
            headers,
            method: 'POST',
            body: JSON.stringify({
              operationName: 'GetChampionshipQualifications',
              query: GetChampionshipQualifications,
              variables: {
                competitionId: BUDAPEST_ID,
                eventId,
              },
            }),
          })
        ).json();
        const entryNumber = data.getChampionshipQualifications.entryNumber;
        const athletes = data.getChampionshipQualifications.qualifications
          .map((q) => ({
            id: q.urlSlug.split('-').at(-1),
            year: '2023',
          }))
          .slice(0, 6);
        const { response } = await (
          await fetch('https://habs.sdf.org:8080/match', {
            method: 'POST',
            body: JSON.stringify({ athletes, gender, discipline, temperature }),
          })
        ).json();
        console.log(response.replaceAll('\n', '\\n').slice(0, 500));
        previews[genderedEvt] = response;
        fs.writeFileSync(`script/roadto_${temperature}.json`, JSON.stringify(previews));
      }
    }
  }
  }
})();
