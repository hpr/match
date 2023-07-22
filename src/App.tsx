import { Autocomplete, Avatar, Badge, Box, Button, Grid, Group, Paper, Stack, Table, TransferList, Text, ActionIcon, Select } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { AthleteAutocomplete } from './AthleteAutocomplete';
import { AthleteInfo } from './types';
import { getAvatarUrl } from './util';
import { Trash } from 'tabler-icons-react';
import { SERVER_URL, disciplines } from './const';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

export default function App() {
  const [athleteIds, setAthleteIds] = useState<string[]>([]);
  const [athleteInfo, setAthleteInfo] = useState<AthleteInfo>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const isReady = !!(athleteIds.length && discipline);

  return (
    <Stack justify="center" align="center">
      <Paper withBorder m="xl" p="md" mb="xs">
        <Stack justify="center" align="center">
          <Group position="center">
            <AthleteAutocomplete
              addAthlete={(id) => !athleteIds.includes(id) && setAthleteIds([...athleteIds, id])}
              disabled={athleteIds.length >= 8}
              athleteInfo={athleteInfo}
              setAthleteInfo={setAthleteInfo}
            />
          </Group>
          <Paper withBorder m="sm" mb={0} p="md" sx={{ width: 500 }}>
            {athleteIds.length ? (
              <Table verticalSpacing="md">
                <tbody>
                  {athleteIds.map((aid) => {
                    const { givenName, familyName, aaAthleteId, disciplines } = athleteInfo[aid];
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
                    athleteIds,
                    discipline,
                    gender: athleteInfo[athleteIds.find((aid) => athleteInfo[aid].gender)!]?.gender ?? 'Men',
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
