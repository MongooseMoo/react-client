export { };

// Parts of the File System Access API that Chromium ships but lib.dom does not
// declare. Every one is optional because Firefox and Safari lack them.
declare global {
    interface FileSystemHandlePermissionDescriptor {
        mode?: 'read' | 'readwrite';
    }

    interface FileSystemHandle {
        queryPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
        requestPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    }

    interface DirectoryPickerOptions {
        id?: string;
        mode?: 'read' | 'readwrite';
        startIn?: 'desktop' | 'documents' | 'downloads' | FileSystemHandle;
    }

    interface Window {
        showDirectoryPicker?(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
    }
}
