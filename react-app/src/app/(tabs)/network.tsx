import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useBottomClearance } from '@/components/ai-assistant-button';
import { useTabBarScrollHandler } from '@/components/tab-bar-visibility';
import { FilterBar } from '@/components/discover/filter-bar';
import { NetworkTile } from '@/components/network/network-tile';
import { Card, PrimaryButton, SectionTitle } from '@/components/ui';
import { type Filters, matchesFilters } from '@/data/discover';
import { useCompanies, useDemoProposals, useNetwork } from '@/state/preview';
import { space, type, useBondColors } from '@/theme/tokens';

const MAX_WIDTH = 720;
const GAP = space[3];

/**
 * Your Network (docs/bond-app-structure.md §2, docs/your-network-section-mockup.png):
 * a grid of companies that proposed to you, then the ones you saved. Tap a
 * tile for their profile with Accept / Reject.
 */
export default function NetworkScreen() {
  const colors = useBondColors();
  const bottomClearance = useBottomClearance();
  // Hides the tab bar while scrolling down, shows it scrolling up.
  const onScroll = useTabBarScrollHandler();
  const { width } = useWindowDimensions();
  const { incoming, saved } = useNetwork();
  const { getCompany } = useCompanies();
  const { demoProposals } = useDemoProposals();
  const [filters, setFilters] = useState<Filters>({});

  const tileWidth = (Math.min(width, MAX_WIDTH) - space[4] * 2 - GAP) / 2;

  const proposals = useMemo(
    () =>
      incoming
        .map((p) => ({ proposal: p, company: getCompany(p.companyId) }))
        .filter(({ company }) => matchesFilters(company, filters, demoProposals)),
    [incoming, filters, getCompany, demoProposals],
  );
  const savedCompanies = useMemo(
    () =>
      saved
        .filter((id) => !incoming.some((p) => p.companyId === id))
        .map(getCompany)
        .filter((c) => matchesFilters(c, filters, demoProposals)),
    [saved, incoming, filters, getCompany, demoProposals],
  );

  const nothingAtAll = incoming.length === 0 && saved.length === 0;
  const nothingMatches = !nothingAtAll && proposals.length === 0 && savedCompanies.length === 0;

  const open = (id: string) => router.push({ pathname: '/network/[id]', params: { id } });

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <View style={[styles.filters, { borderBottomColor: colors.line }]}>
        <FilterBar
          filters={filters}
          onChange={setFilters}
          primary={['location', 'identity', 'size']}
          more={[]}
          resultCount={proposals.length + savedCompanies.length}
        />
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: bottomClearance }]}
      >
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={[type.heading, { color: colors.ink }]}>
            Your Network
          </Text>
          <Text style={[type.body, { color: colors.inkMuted }]}>
            Businesses that have proposed working with you, and the ones you saved.
          </Text>
        </View>

        {nothingAtAll ? (
          <Card>
            <Text style={[type.subheading, { color: colors.ink }]}>Nothing here yet</Text>
            <Text style={[type.body, { color: colors.inkMuted }]}>
              When a business sends you a proposal it shows up here. Save businesses on Discover to come back to them.
            </Text>
          </Card>
        ) : nothingMatches ? (
          <Card>
            <Text style={[type.subheading, { color: colors.ink }]}>No businesses match these filters</Text>
            <PrimaryButton label="Clear filters" onPress={() => setFilters({})} />
          </Card>
        ) : null}

        {proposals.length > 0 ? (
          <View style={styles.section}>
            <SectionTitle>Proposed to you ({proposals.length})</SectionTitle>
            <View style={styles.grid}>
              {proposals.map(({ proposal, company }) => (
                <NetworkTile
                  key={company.id}
                  company={company}
                  kind="proposal"
                  snippet={proposal.title}
                  width={tileWidth}
                  onPress={() => open(company.id)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {savedCompanies.length > 0 ? (
          <View style={styles.section}>
            <SectionTitle>Saved ({savedCompanies.length})</SectionTitle>
            <View style={styles.grid}>
              {savedCompanies.map((company) => (
                <NetworkTile
                  key={company.id}
                  company={company}
                  kind="saved"
                  width={tileWidth}
                  onPress={() => open(company.id)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filters: { paddingVertical: space[3], borderBottomWidth: StyleSheet.hairlineWidth },
  content: { padding: space[4], gap: space[6], width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  intro: { gap: space[1] },
  section: { gap: space[3] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
});
