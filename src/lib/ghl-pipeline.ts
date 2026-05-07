import { ghlRequest } from './ghl';

const GHL_VENDOR_PIPELINE_ID = process.env.GHL_VENDOR_PIPELINE_ID || '';

interface PipelineStage {
  id: string;
  name: string;
}

interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

// In-memory cache for pipeline stages (refreshes every 10 minutes)
let pipelineCache: { pipeline: Pipeline; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function getVendorPipeline(): Promise<Pipeline | null> {
  if (!GHL_VENDOR_PIPELINE_ID) {
    console.warn('[GHL Pipeline] GHL_VENDOR_PIPELINE_ID not configured');
    return null;
  }

  if (pipelineCache && Date.now() - pipelineCache.fetchedAt < CACHE_TTL_MS) {
    return pipelineCache.pipeline;
  }

  try {
    const result: any = await ghlRequest(`/pipelines/${GHL_VENDOR_PIPELINE_ID}`);
    if (!result || !result.pipeline) {
      console.warn('[GHL Pipeline] Pipeline not found:', GHL_VENDOR_PIPELINE_ID);
      return null;
    }

    const pipeline: Pipeline = {
      id: result.pipeline.id,
      name: result.pipeline.name,
      stages: (result.pipeline.stages || []).map((s: any) => ({
        id: s.id,
        name: s.name,
      })),
    };

    pipelineCache = { pipeline, fetchedAt: Date.now() };
    return pipeline;
  } catch (error) {
    console.error('[GHL Pipeline] Failed to fetch pipeline:', error);
    return null;
  }
}

export function getStageIdByName(pipeline: Pipeline, stageName: string): string | null {
  const stage = pipeline.stages.find(
    (s) => s.name.toLowerCase().trim() === stageName.toLowerCase().trim()
  );
  return stage?.id || null;
}

export async function findOpportunityByContactAndPipeline(
  contactId: string,
  pipelineId: string
): Promise<{ id: string; stageId: string } | null> {
  try {
    const result: any = await ghlRequest(
      `/opportunities/?locationId=${process.env.GHL_LOCATION_ID || ''}&contactId=${encodeURIComponent(contactId)}&pipelineId=${encodeURIComponent(pipelineId)}&limit=5`
    );
    const opps = result?.opportunities || [];
    for (const opp of opps) {
      if (opp.pipelineId === pipelineId) {
        return { id: opp.id, stageId: opp.pipelineStageId };
      }
    }
    return null;
  } catch (error) {
    console.warn('[GHL Pipeline] Failed to find opportunity:', error);
    return null;
  }
}

export async function createOpportunity(options: {
  name: string;
  contactId: string;
  pipelineId: string;
  pipelineStageId: string;
  monetaryValue?: number;
  status?: string;
}): Promise<{ id: string } | null> {
  try {
    const payload: Record<string, any> = {
      name: options.name,
      contactId: options.contactId,
      pipelineId: options.pipelineId,
      pipelineStageId: options.pipelineStageId,
      status: options.status || 'open',
    };
    if (options.monetaryValue !== undefined) {
      payload.monetaryValue = options.monetaryValue;
    }

    const result: any = await ghlRequest('/opportunities/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result && result.opportunity?.id) {
      return { id: result.opportunity.id };
    }
    if (result && result.id) {
      return { id: result.id };
    }
    console.warn('[GHL Pipeline] Create opportunity returned unexpected shape:', result);
    return null;
  } catch (error) {
    console.error('[GHL Pipeline] Failed to create opportunity:', error);
    return null;
  }
}

export async function updateOpportunityStage(
  opportunityId: string,
  pipelineStageId: string
): Promise<boolean> {
  try {
    await ghlRequest(`/opportunities/${opportunityId}`, {
      method: 'PUT',
      body: JSON.stringify({
        pipelineStageId,
      }),
    });
    return true;
  } catch (error) {
    console.error('[GHL Pipeline] Failed to update opportunity stage:', error);
    return false;
  }
}
