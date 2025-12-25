// Home Assistant entity state interface
export interface FlightEntityState {
  state: string;
  attributes: {
    friendly_name?: string;
    flight_number?: string;
    airline?: string;
    origin?: string;
    destination?: string;
    altitude?: number;
    speed?: number;
    heading?: number;
    latitude?: number;
    longitude?: number;
    aircraft_type?: string;
    registration?: string;
    [key: string]: unknown;
  };
  entity_id: string;
  last_changed: string;
  last_updated: string;
}

export type ChangedProps = PropertyValues<{
  hass: HomeAssistant;
  _config: FlightradarFlightCardConfig;
}>;

// Grabbed from https://github.com/home-assistant/frontend/blob/dev/src/types.ts
export interface HomeAssistant {
  auth: Auth & { external?: ExternalMessaging };
  connection: Connection;
  connected: boolean;
  states: HassEntities;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, AreaRegistryEntry>;
  floors: Record<string, FloorRegistryEntry>;
  services: HassServices;
  config: HassConfig;
  themes: Themes;
  selectedTheme: ThemeSettings | null;
  panels: Panels;
  panelUrl: string;
  // i18n
  // current effective language in that order:
  //   - backend saved user selected language
  //   - language in local app storage
  //   - browser language
  //   - english (en)
  language: string;
  // local stored language, keep that name for backward compatibility
  selectedLanguage: string | null;
  locale: FrontendLocaleData;
  resources: Resources;
  localize: LocalizeFunc;
  translationMetadata: TranslationMetadata;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  debugConnection: boolean;
  dockedSidebar: 'docked' | 'always_hidden' | 'auto';
  moreInfoEntityId: string | null;
  user?: CurrentUser;
  userData?: CoreFrontendUserData;
  systemData?: CoreFrontendSystemData;
  hassUrl(path?): string;
  callService<T = any>(
    domain: ServiceCallRequest['domain'],
    service: ServiceCallRequest['service'],
    serviceData?: ServiceCallRequest['serviceData'],
    target?: ServiceCallRequest['target'],
    notifyOnError?: boolean,
    returnResponse?: boolean
  ): Promise<ServiceCallResponse<T>>;
  callApi<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    parameters?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T>;
  callApiRaw( // introduced in 2024.11
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    parameters?: Record<string, any>,
    headers?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<Response>;
  fetchWithAuth(path: string, init?: Record<string, any>): Promise<Response>;
  sendWS(msg: MessageBase): void;
  callWS<T>(msg: MessageBase): Promise<T>;
  loadBackendTranslation(
    category: Parameters<typeof getHassTranslations>[2],
    integrations?: Parameters<typeof getHassTranslations>[3],
    configFlow?: Parameters<typeof getHassTranslations>[4]
  ): Promise<LocalizeFunc>;
  loadFragmentTranslation(fragment: string): Promise<LocalizeFunc | undefined>;
  formatEntityState(stateObj: HassEntity, state?: string): string;
  formatEntityAttributeValue(stateObj: HassEntity, attribute: string, value?: any): string;
  formatEntityAttributeName(stateObj: HassEntity, attribute: string): string;
  formatEntityName(
    stateObj: HassEntity,
    type: EntityNameItem | EntityNameItem[],
    separator?: EntityNameOptions
  ): string;
}

// Grabbed from https://github.com/home-assistant/frontend/blob/dev/src/data/entity_registry.ts
export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels: string[];
  hidden?: boolean;
  entity_category?: EntityCategory;
  translation_key?: string;
  platform?: string;
  display_precision?: number;
  has_entity_name?: boolean;
}
