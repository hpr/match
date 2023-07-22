import { Avatar, Button, Group, Paper, Stack, Table, Text, ActionIcon, Select } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { AthleteAutocomplete } from './AthleteAutocomplete';
import { AthleteInfo } from './types';
import { competitorBasicInfo, getAvatarUrl } from './util';
import { Trash } from 'tabler-icons-react';
import { SERVER_URL, disciplines } from './const';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

export default function App() {
  const [athleteIds, setAthleteIds] = useState<string[]>([]);
  const [athleteInfo, setAthleteInfo] = useState<AthleteInfo>({});
  const [athleteYears, setAthleteYears] = useState<{ [id: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const isReady = !!(athleteIds.length && discipline && athleteIds.every(aid => athleteYears[aid]));

  return (
    <Stack justify="center" align="center">
      <Paper withBorder m="xl" p="md" mb="xs">
        <Stack justify="center" align="center">
          <Group position="center">
            <AthleteAutocomplete
              addAthlete={async (id) => {
                if (!athleteIds.includes(id)) {
                  setAthleteIds([...athleteIds, id]);
                  const basicInfo = await competitorBasicInfo(id);
                  const activeYears = basicInfo.resultsByYear.activeYears;
                  setAthleteYears({ ...athleteYears, [id]: activeYears[0] });
                  setAthleteInfo({ ...athleteInfo, [id]: { ...athleteInfo[id], CompetitorBasicInfo: basicInfo } });
                }
              }}
              disabled={athleteIds.length >= 8}
              athleteInfo={athleteInfo}
              setAthleteInfo={setAthleteInfo}
            />
          </Group>
          <Paper withBorder m="sm" mb={0} p="md" sx={{ width: 550 }}>
            {athleteIds.length ? (
              <Table verticalSpacing="md">
                <tbody>
                  {athleteIds.map((aid) => {
                    const { givenName, familyName, aaAthleteId, disciplines } = athleteInfo[aid].SearchCompetitor;
                    const activeYears = athleteInfo[aid].CompetitorBasicInfo?.resultsByYear.activeYears;
                    return (
                      <tr key={aaAthleteId}>
                        <td>
                          <Group spacing="sm">
                            <Avatar size={40} src={getAvatarUrl(aaAthleteId)} radius={40}>
                              {givenName[0]}
                              {familyName[0]}
                            </Avatar>
                            <div>
                              <Text fz="sm" fw={500}>
                                {givenName} {familyName}
                              </Text>
                              <Text c="dimmed" fz="xs">
                                {disciplines}
                              </Text>
                            </div>
                          </Group>
                        </td>
                        <td style={{ width: 110 }}>
                          {activeYears ? (
                            <Select data={activeYears} value={athleteYears[aid]} onChange={(y) => y && setAthleteYears({ ...athleteYears, [aid]: y })} />
                          ) : (
                            'Loading...'
                          )}
                        </td>
                        <td>
                          <Group spacing={0} position="right">
                            <ActionIcon onClick={() => setAthleteIds(athleteIds.filter((id) => id !== aid))}>
                              <Trash />
                            </ActionIcon>
                          </Group>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              <Text italic style={{ textAlign: 'center' }}>
                Add athletes above...
              </Text>
            )}
          </Paper>
          <Select label="Race Distance?" searchable data={disciplines} value={discipline} onChange={setDiscipline} />
          <Button
            color="green"
            size="lg"
            loading={isGenerating}
            disabled={!isReady || isGenerating}
            onClick={async () => {
              setIsGenerating(true);
              const { response } = await (
                await fetch(SERVER_URL, {
                  method: 'POST',
                  body: JSON.stringify({
                    athletes: athleteIds.map((id) => ({ id, year: athleteYears[id] })),
                    discipline,
                    gender: athleteInfo[athleteIds.find((aid) => athleteInfo[aid].SearchCompetitor.gender)!]?.SearchCompetitor.gender ?? 'Men',
                  }),
                })
              ).json();
              setResponse(response);
              setIsGenerating(false);
            }}
          >
            {isGenerating ? 'Generating... (Can take several minutes)' : 'Generate Prediction'}
          </Button>
        </Stack>
      </Paper>
      {response && (
        <Paper withBorder m="xl" p="md" mt="xs">
          <ReactMarkdown>{response}</ReactMarkdown>
        </Paper>
      )}
    </Stack>
  );
}
