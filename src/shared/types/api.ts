export type UserRole = 'ADMIN' | 'MANAGER' | 'TECH';
export type ResourceStatus = 'ONLINE' | 'OFFLINE' | 'ERROR' | 'UNKNOWN';
export type PowerSource = 'BMC' | 'BATTERY' | 'HWMON' | 'RAPL' | 'MODEL';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type RecommendationStatus = 'OPEN' | 'ACKNOWLEDGED' | 'APPLIED' | 'DISMISSED';
export type Granularity = 'hour' | 'day' | 'month';
export type MetricKind = 'cpu' | 'memory' | 'network' | 'storage';
export type IdleAttributionPolicy = 'OVERHEAD' | 'PRORATA';

export type RuleCode =
    | 'CPU_OVERPROVISIONED'
    | 'MEMORY_OVERPROVISIONED'
    | 'NO_LIMITS_SET'
    | 'IDLE_CONTAINER'
    | 'OVERSIZED_IMAGE'
    | 'EXITED_CONTAINER_PRESENT'
    | 'RESTART_LOOP'
    | 'CPU_HIGH'
    | 'MEMORY_HIGH'
    | 'HEAVY_BASE_IMAGE'
    | 'NO_MULTISTAGE_BUILD'
    | 'APT_CACHE_NOT_CLEANED'
    | 'RUNS_AS_ROOT'
    | 'COMPOSE_NO_LIMITS'
    | 'COMPOSE_LIMIT_TOO_HIGH'
    | 'UNUSED_SERVICE';

export interface PaginationMeta {
    page_no: number;
    per_page: number;
    total_items: number;
    total_pages: number;
}

export interface Page<T> {
    dataset: T[];
    pagination: PaginationMeta;
}

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Host {
    id: number;
    name: string;
    docker_url: string;
    cpu_cores: number;
    total_memory_bytes: number;
    os_info: string | null;
    power_source: PowerSource;
    status: ResourceStatus;
    last_seen_at: string | null;
    last_error: string | null;
}

export interface Project {
    id: number;
    host_id: number;
    name: string;
    display_name: string | null;
    is_registered: boolean;
    compose_path: string | null;
    working_dir: string | null;
    config_read_at: string | null;
    config_error: string | null;
    status: ResourceStatus;
    first_seen_at: string;
    last_seen_at: string;
    last_sync_at: string | null;
    host: Host | null;
}

export interface ProjectSummary {
    project: Project;
    container_count: number;
    running_count: number;
    cpu_percent_of_host: number;
    memory_bytes: number;
    power_watts: number;
    energy_kwh: number;
    co2_kg: number;
    recommendation_count: number;
    critical_count: number;
    has_live_data: boolean;
}

export interface ConfigFile {
    id: number;
    project_id: number;
    kind: 'COMPOSE' | 'DOCKERFILE';
    path: string;
    service_name: string | null;
    content: string;
    content_hash: string;
    source: 'AUTO' | 'UPLOAD';
    read_at: string;
}

export interface ProjectConfigStatus {
    project_id: number;
    is_registered: boolean;
    compose_path: string | null;
    config_read_at: string | null;
    config_error: string | null;
    files: ConfigFile[];
}

export interface LivePoint {
    timestamp: string;
    power_watts: number;
    energy_wh_cumulative: number;
    co2_g_cumulative: number;
    cpu_percent_of_host: number;
    memory_bytes: number;
}

export interface LiveSeries {
    project_id: number;
    project_name: string;
    container_count: number;
    points: LivePoint[];
    energy_wh_total: number;
    co2_g_total: number;
    average_power_watts: number;
}

export interface LiveResponse {
    series: LiveSeries[];
    window_start: string;
    window_end: string;
    interval_seconds: number;
}

export interface RecommendationPatch {
    file_path: string;
    kind: string;
    service: string | null;
    before: string;
    after: string;
    unified_diff: string;
}

export interface Container {
    id: number;
    project_id: number;
    name: string;
    docker_id: string;
    service_name: string | null;
    image_ref: string;
    image_id: string | null;
    image_size_bytes: number | null;
    cpu_limit_cores: number | null;
    memory_limit_bytes: number | null;
    status: string;
    restart_count: number;
    started_at: string | null;
    first_seen_at: string;
    last_seen_at: string;
    cpu_percent: number;
    cpu_cores_used: number;
    memory_working_set_bytes: number;
    memory_percent: number | null;
    cpu_percent_of_limit: number | null;
    memory_percent_of_limit: number | null;
    net_rate_bps: number;
    io_rate_bps: number;
    uptime_seconds: number;
    energy_kwh: number;
    co2_kg: number;
}

export interface ContainerDetail extends Container {
    project_name: string;
    sample_count: number;
    first_metric_at: string | null;
    last_metric_at: string | null;
}

export interface MetricPoint {
    timestamp: string;
    value: number;
    secondary_value: number | null;
}

export interface MetricSeries {
    metric: string;
    unit: string;
    label: string;
    secondary_label: string | null;
    points: MetricPoint[];
}

export interface ProjectEnergySeries {
    project_id: number;
    project_name: string;
    points: EnergyPoint[];
}

export interface BreakdownItem {
    entity_id: number;
    label: string;
    energy_kwh: number;
    co2_kg: number;
}

export interface EnergyTotals {
    energy_kwh: number;
    co2_kg: number;
    average_power_watts: number;
    sample_count: number;
    window_start: string;
    window_end: string;
}

export interface CarbonPoint {
    timestamp: string;
    co2_kg: number;
}

export interface EnergyPoint {
    timestamp: string;
    energy_kwh: number;
    co2_kg: number;
}

export interface Recommendation {
    id: number;
    project_id: number;
    container_id: number | null;
    rule_code: RuleCode;
    severity: Severity;
    difficulty: Difficulty;
    title: string;
    description: string;
    current_value: Record<string, unknown>;
    suggested_value: Record<string, unknown>;
    estimated_energy_saving_kwh: number | null;
    estimated_co2_saving_kg: number | null;
    saving_is_computed: boolean;
    saving_note: string | null;
    status: RecommendationStatus;
    evidence: Record<string, unknown>;
    source: 'RUNTIME' | 'CONFIG';
    patch: RecommendationPatch | null;
    detected_at: string;
    updated_at: string;
}

export interface ScanResult {
    project_id: number;
    analysed_containers: number;
    analysed_services: number;
    created: number;
    updated: number;
    resolved: number;
    open_total: number;
    computed_saving_kwh: number;
    computed_saving_kg_co2: number;
    saving_note: string;
}

export interface ComparisonSideMetrics {
    project_id: number;
    project_name: string;
    period_start: string;
    period_end: string;
    duration_hours: number;
    container_count: number;
    cpu_percent_avg: number;
    cpu_percent_p95: number;
    memory_bytes_avg: number;
    memory_bytes_max: number;
    total_image_size_bytes: number;
    energy_kwh: number;
    co2_kg: number;
    energy_kwh_per_hour: number;
    co2_kg_per_hour: number;
    energy_kwh_per_hour_per_container: number;
}

export interface GainItem {
    key: string;
    label: string;
    unit: string;
    before: number;
    after: number;
    gain_percent: number | null;
    is_normalized: boolean;
}

export interface ComparisonResult {
    side_a: ComparisonSideMetrics;
    side_b: ComparisonSideMetrics;
    gains: GainItem[];
    warnings: string[];
}

export interface Comparison {
    id: number;
    name: string;
    project_a_id: number;
    project_b_id: number;
    period_a_start: string;
    period_a_end: string;
    period_b_start: string;
    period_b_end: string;
    created_by: number | null;
    created_at: string;
    result: ComparisonResult;
}

export interface GreenConfig {
    id: number;
    version: number;
    is_active: boolean;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    emission_factor_g_per_kwh: number;
    emission_factor_label: string;
    p_idle_watts: number;
    p_max_watts: number;
    mem_power_w_per_gb: number;
    non_cpu_overhead_ratio: number;
    max_idle_ratio: number;
    weight_cpu: number;
    weight_memory: number;
    weight_io: number;
    weight_network: number;
    idle_attribution_policy: IdleAttributionPolicy;
    threshold_cpu_underuse_percent: number;
    threshold_memory_underuse_percent: number;
    threshold_idle_cpu_percent: number;
    threshold_idle_network_bps: number;
    threshold_idle_hours: number;
    threshold_image_size_bytes: number;
    threshold_exited_days: number;
    threshold_restart_count: number;
    analysis_window_days: number;
    threshold_cpu_high_percent: number;
    threshold_memory_high_percent: number;
    live_retention_minutes: number;
    persist_every_n_ticks: number;
    calibration_note: string | null;
}

