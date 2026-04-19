import { apiClient } from './apiClient';
import type { HealthResponse, ModelInfoResponse } from '@/types/apiTypes';
import type { CustomerFeatures, PredictionResponse, SegmentInfo, SegmentOverviewResponse } from '@/types/customerTypes';
import type { RecommendationResponse } from '@/types/productTypes';

export const mlService = {
    health: () => apiClient.get<HealthResponse>('/health').then((r) => r.data),

    predictPurchase: (features: CustomerFeatures) => apiClient.post<PredictionResponse>('/predict/purchase', features).then((r) => r.data),

    recommend: (stockCode: string, topK = 10) =>
        apiClient
            .get<RecommendationResponse>(`/recommend/${stockCode}`, {
                params: { top_k: topK },
            })
            .then((r) => r.data),

    segmentCustomer: (features: CustomerFeatures) => apiClient.post<SegmentInfo>('/segment/customer', features).then((r) => r.data),

    segmentsOverview: () => apiClient.get<SegmentOverviewResponse>('/segments/overview').then((r) => r.data),

    modelInfo: () => apiClient.get<ModelInfoResponse>('/models/info').then((r) => r.data),
};
