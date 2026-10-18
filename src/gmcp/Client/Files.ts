import { SharingPackage } from '../../fileSharing/gmcpPackage';
import { validateFiles, type FilesInbound, type FilesOutbound } from '../../fileSharing/protocol';
export class GMCPClientFiles extends SharingPackage<FilesInbound,FilesOutbound> {
  override readonly packageName = 'Client.Files';
  validate<K extends keyof FilesInbound>(kind: K, data: unknown): FilesInbound[K] { return validateFiles(kind,data); }
}
