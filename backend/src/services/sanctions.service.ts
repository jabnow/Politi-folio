/**
 * OFAC API + custom MCP for sanctions screening
 */
export class SanctionsService {
  async check(_entity: string): Promise<{ matched: boolean }> {
    // TODO: Integrate OFAC API and custom MCP
    return { matched: false }
  }
}
