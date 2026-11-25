import { AccessibleText as Text, AccessibleTextInput as TextInput } from '../../components/ui/AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AppScreen } from "../../components/app/AppScreen";
import { AppIcon } from "../../components/app/AppIcon";
import { CareDisclosure, useCareStyles } from "../../components/app/CareUI";
import { Button } from "../../components/ui/Button";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { usePalette } from "../../theme/AppearanceProvider";
import { directoryDirections, publicApi as apiClient } from "../care-directory/api";
import { bankListSchema, dialNumber, type Bank } from "../../services/api/healthResourcesApi";
import { DirectoryLocationControl } from "../care-directory/DirectoryLocationControl";
import { NEARBY_RADIUS_KM, useDirectoryLocation } from "../care-directory/useDirectoryLocation";
export function EmergencyButton({ inline = false }: { inline?: boolean }) {
  const router = useRouter();
  const { t: tr } = useTranslation();
  const colors = usePalette();
  return (
    <TouchTarget
      accessibilityRole="button"
      accessibilityLabel={tr("Emergency contacts and blood banks")}
      onPress={() => router.push("/emergency")}
      style={({ pressed }) => ({
        position: inline ? "relative" : "absolute",
        right: inline ? undefined : 16,
        bottom: inline ? undefined : 16,
        alignSelf: inline ? "stretch" : "flex-end",
        justifyContent: "center",
        paddingVertical: 14,
        minHeight: 52,
        paddingHorizontal: 18,
        borderRadius: 14,
        backgroundColor: colors.errorSurface,
        borderWidth: 1,
        borderColor: colors.error,
        opacity: pressed ? 0.75 : 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      })}
    >
      <AppIcon name="phone" color={colors.error} size={22} />
      <Text
        style={{ color: colors.error, fontSize: 16, fontWeight: "600" }}
      >
        {tr("Emergency")}</Text>
      <AppIcon name="right" color={colors.error} size={18} />
    </TouchTarget>
  );
}
export function BloodBanksScreen() {
  const { t: tr, language } = useTranslation();
  const [reportBank, setReportBank] = useState<string | null>(null), [reportText, setReportText] = useState(''), [reportStatus, setReportStatus] = useState(''), [sendingReport, setSendingReport] = useState(false);
  async function sendBankReport(id: string) {
    if (sendingReport) return;
    setSendingReport(true); setReportStatus('');
    try { await apiClient.request({ path: `/care/blood-banks/${id}/corrections`, method: 'POST', body: { message: reportText.trim() } }); setReportStatus('Report received for review. It does not change the listing automatically.'); setReportText(''); }
    catch { setReportStatus('Your report could not be sent. Please try again.'); }
    finally { setSendingReport(false); }
  }
  const c = useCareStyles(),
    colors = usePalette(),
    { nearby, city: initialCity, search: initialSearch } = useLocalSearchParams<{ nearby?: string; city?: string; search?: string }>();
  const [search, setSearch] = useState(initialSearch ?? ""),
    [term, setTerm] = useState(initialSearch ?? ""),
    [only24h, setOnly24h] = useState(false),
    [radius, setRadius] = useState(NEARBY_RADIUS_KM),
    [revision, setRevision] = useState(0);
  const area = useDirectoryLocation(nearby === "1", true, initialCity);
  const { position: coords, city } = area;
  const paginationKey = JSON.stringify([coords, city, term, only24h, radius]);
  const [selection, setSelection] = useState({ key: paginationKey, page: 1 });
  const page = paginationKey === selection.key ? selection.page : 1;
  const setPage = (page: number) => setSelection({ key: paginationKey, page });
  const canLoad = !area.locating && !!(coords || city || term);
  const hindi = language === 'hi';
  const requestKey = JSON.stringify([paginationKey, page, revision]);
  const [response, setResponse] = useState<{
    key: string;
    data: ReturnType<typeof bankListSchema.parse> | null;
    error: string;
  } | null>(null);
  const loading = canLoad && response?.key !== requestKey,
    result = canLoad && !loading ? response?.data : null,
    error = canLoad && !loading ? response?.error : "";
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  useEffect(() => {
    if (!canLoad) return;
    const controller = new AbortController();
    let current = true;
    const query = new URLSearchParams({
      page: String(page),
      search: term,
      only24h: String(only24h),
    });
    if (city) query.set("city", city);
    void apiClient
      .request({
        path: coords ? "/public/blood-banks/nearby" : `/public/blood-banks?${query}`,
        method: coords ? "POST" : "GET",
        body: coords
          ? {
              latitude: coords.latitude,
              longitude: coords.longitude,
              radiusKm: radius,
              search: term,
              page,
              only24h,
            }
          : undefined,
        signal: controller.signal,
      })
      .then((data) => {
        const parsed = bankListSchema.parse(data);
        if (current) setResponse({ key: requestKey, data: parsed, error: "" });
      })
      .catch(() => {
        if (current)
          setResponse({
            key: requestKey,
            data: null,
            error:
              "Blood banks could not load. Check your connection and retry.",
          });
      });
    return () => {
      current = false;
      controller.abort();
    };
  }, [canLoad, city, coords, term, only24h, radius, page, requestKey]);
  const [actionError, setActionError] = useState<string | null>(null);
  async function open(url: string, bankId: string) {
    setActionError(null);
    try {
      await Linking.openURL(url);
    } catch {
      if (alive.current) setActionError(bankId);
    }
  }
  function bankRow(bank: Bank) {
    const phone = dialNumber(bank.phone, bank.country_code),
      emergency = dialNumber(bank.emergency_phone, bank.emergency_country_code);
    const address = (hindi && bank.address_hi) || bank.address_en || bank.address_hi;
    const locality = [bank.city, bank.state, bank.pincode].filter(Boolean).join(', ');
    const directions = directoryDirections({
      name: bank.name_en,
      address: bank.address_en || bank.address_hi,
      locality,
      latitude: bank.latitude,
      longitude: bank.longitude,
    });
    const features = [
      bank.is_24_7 && "Listed as 24 hours",
      bank.is_government && "Government",
      bank.component_facility && "Components",
      bank.apheresis_facility && "Apheresis",
    ].flatMap((label) => label ? [tr(label)] : []);
    return (
      <View
        key={bank.id}
        style={{
          padding: 18,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 12,
        }}
      >
        <Text style={c.title}>{(hindi && bank.name_hi) || bank.name_en}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <AppIcon name="location" size={19} color={colors.primary} />
          <View style={{ flex: 1, gap: 4 }}>
            {!!address && <Text selectable style={c.text}>{address}</Text>}
            {!!locality && <Text selectable style={c.text}>{locality}</Text>}
            {bank.distanceKm != null && <Text style={[c.text, { color: colors.primary }]}>
              {bank.distanceKm < 0.1 ? tr("Under 0.1") : bank.distanceKm.toFixed(1)} {tr("km away · straight-line")}
            </Text>}
          </View>
        </View>
        {!!bank.phone && <Text selectable style={c.text}>{tr("Phone: ")}{bank.country_code} {bank.phone}</Text>}
        {!!bank.emergency_phone && emergency !== phone && (
          <Text selectable style={c.text}>{tr("Emergency contact: ")}{bank.emergency_country_code} {bank.emergency_phone}</Text>
        )}
        {!phone && !emergency && <Text style={c.text}>{tr("No telephone number listed.")}</Text>}
        {(phone || directions) && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {phone && <View style={{ flexGrow: 1, flexBasis: 110 }}>
              <Button title="Call" onPress={() => void open(phone, bank.id)} />
            </View>}
            {directions && <View style={{ flexGrow: 1, flexBasis: 110 }}>
              <Button title="Directions" variant="secondary" onPress={() => void open(directions, bank.id)} />
            </View>}
          </View>
        )}
        {!!emergency && emergency !== phone && <Button title="Call emergency contact" variant="secondary" onPress={() => void open(emergency, bank.id)} />}
        {actionError === bank.id && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>
          {tr("Could not open this action. The address and phone number are shown above.")}
        </Text>}
        {!!features.length && <Text style={c.text}>{features.join(' · ')}</Text>}
        {!!bank.available_blood_groups.length && <Text style={c.text}>
          {tr("Listed groups:")} {bank.available_blood_groups.join(", ")}
        </Text>}
        <Text style={c.text}>{tr("Call to confirm blood availability and opening hours.")}</Text>
        <CareDisclosure title={tr('Report incorrect information')}>
          <Text style={c.text}>{tr('Describe a directory correction only. Do not include medical records or personal health information.')}</Text>
          <TextInput accessibilityLabel={tr('Directory correction')} value={reportBank === bank.id ? reportText : ''} editable={!sendingReport} onChangeText={(text) => { setReportBank(bank.id); setReportText(text); setReportStatus(''); }} multiline maxLength={1000} style={{ color: colors.ink, minHeight: 80, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12 }} />
          <Button title={tr('Send correction')} loading={sendingReport && reportBank === bank.id} disabled={sendingReport || reportBank !== bank.id || reportText.trim().length < 10} onPress={() => void sendBankReport(bank.id)} />
          {reportBank === bank.id && !!reportStatus && <Text accessibilityLiveRegion="polite" style={c.text}>{tr(reportStatus)}</Text>}
        </CareDisclosure>
      </View>
    );
  }
  return (
    <AppScreen
      title={tr("Blood banks")}
      back
      onRefresh={canLoad ? () => setRevision((value) => value + 1) : undefined}
      refreshing={loading && !!response?.data}
    >
      <View style={{ gap: 16 }}>
        <Text style={c.heading}>{tr("Find a blood bank near you")}</Text>
        <Text style={c.text}>
          {tr("Find contact details and directions. This directory does not show live blood stock or provide emergency dispatch.")}</Text>
        <DirectoryLocationControl area={area} radiusKm={radius} />
        <View style={{ gap: 16 }}>
        <TextInput
          accessibilityLabel={tr("Pincode or blood-bank name")}
          placeholder={tr("Pincode or bank name")}
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
          maxLength={150}
          onSubmitEditing={() => {
            setTerm(search.trim());
            setPage(1);
          }}
          style={{
            color: colors.ink,
            minHeight: 52,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
          }}
        />
        <Button
          title={tr("Search directory")}
          variant="secondary"
          onPress={() => {
            setTerm(search.trim());
            setPage(1);
          }}
        />
        <CareDisclosure title={tr("Filter listed services")}><View style={{ gap: 16 }}>
        <Button
          title={
            tr(only24h ? "24-hour listings only: on" : "24-hour listings only: off")
          }
          variant="secondary"
          onPress={() => {
            setOnly24h(!only24h);
            setPage(1);
          }}
        />
        {!!coords && (
          <View style={{ gap: 8 }}>
            <Text style={c.text}>{tr("Search radius: ")}{radius} {tr(" km")}</Text>
            <Button
              title={tr(radius === 50 ? "Expand to 200 km" : "Use 50 km radius")}
              variant="secondary"
              onPress={() => {
                setRadius(radius === 50 ? 200 : 50);
                setPage(1);
              }}
            />
          </View>
        )}
        </View></CareDisclosure>
        </View>

        {loading ? (
          <ActivityIndicator accessibilityLabel={tr("Loading blood banks")} />
        ) : error ? (
          <>
            <Text accessibilityRole="alert" style={c.text}>
              {tr(error)}
            </Text>
            <Button
              title={tr("Retry")}
              onPress={() => setRevision((value) => value + 1)}
            />
          </>
        ) : (
          result && (
            <>
              {!!coords && result.missingCoordinates > 0 && (
                <Text style={c.text}>
                  {result.missingCoordinates} {tr(" listings have no coordinates and cannot be distance-ranked. Search by city to see them.")}</Text>
              )}
              <Text style={c.title}>
                {tr(coords
                  ? "Nearest listings"
                  : term
                    ? `Results for ${term}`
                    : city || "Blood-bank directory")}
              </Text>
              {result.items.length ? (
                result.items.map(bankRow)
              ) : (
                <Text style={c.text}>
                  {tr(coords
                    ? "No banks found in this radius. Expand the radius or search by city."
                    : "No matching banks. Try another city, search, or filter.")}
                </Text>
              )}
              {(page > 1 || result.hasNext) && <View style={{ gap: 12 }}>
              <Text style={c.text}>{tr("Page ")}{page}</Text>
              <Button
                title={tr("Previous page")}
                variant="secondary"
                disabled={page === 1}
                onPress={() => setPage(page - 1)}
              />
              <Button
                title={tr("Next page")}
                variant="secondary"
                disabled={!result.hasNext}
                onPress={() => setPage(page + 1)}
              />
              </View>}
            </>
          )
        )}
      </View>
    </AppScreen>
  );
}
