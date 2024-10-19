# File Transfer System Improvement Todo List

1. ✅ Update FileTransferManager.ts:
   - Add a Map to store pending offers with unique keys
   - Modify handleGMCPOffer to store offers with unique keys
   - Update acceptTransfer to use the unique offer key
   - Add a cleanup method for old offers
   - Ensure proper WebRTC signaling flow

2. ✅ Update src/gmcp/Client/FileTransfer.ts:
   - Modify handleOffer to include offerSdp in the emitted event

3. Update FileTransferUI.tsx:
   - Modify the component to handle expanded state
   - Update handleAcceptTransfer to use the new acceptTransfer method
   - Add logic to display multiple pending offers

4. Update App.tsx:
   - Add state for file transfer UI expansion
   - Add event listener for file transfer offers to auto-expand the UI
   - Pass expanded state to FileTransferUI component

5. Create or update FileTransferUI.css:
   - Add styles for expanded/collapsed states

6. Update MudClient.ts:
   - Ensure proper initialization of WebRTCService and FileTransferManager

7. Review and update WebRTCService.ts:
   - Ensure it properly handles offer/answer exchange

8. Testing:
   - Test receiving multiple file transfer offers
   - Verify UI auto-expands when an offer is received
   - Test accepting a transfer and verify WebRTC connection initialization
   - Verify old, unaccepted offers are cleaned up periodically
   - Test complete file transfer process

9. Documentation:
   - Update any relevant documentation to reflect the new file transfer system

10. Code Review:
    - Conduct a thorough code review of all changes
    - Ensure consistent error handling and logging throughout the system

11. Performance Testing:
    - Test the system with large files and multiple simultaneous transfers
    - Optimize if necessary

12. User Experience:
    - Gather feedback on the new file transfer UI and process
    - Make any necessary adjustments based on user feedback

13. Security Audit:
    - Review the file transfer system for any potential security vulnerabilities
    - Implement any necessary security enhancements

14. Deployment:
    - Plan and execute the deployment of the updated file transfer system
    - Monitor for any issues post-deployment
