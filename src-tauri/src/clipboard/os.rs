// Password managers tag secrets with these formats so clipboard history tools skip them.
#[cfg(windows)]
const MARKERS: [windows::core::PCWSTR; 2] =
    [windows::core::w!("ExcludeClipboardContentFromMonitorProcessing"), windows::core::w!("Clipboard Viewer Ignore")];

#[cfg(windows)]
pub fn concealed() -> bool {
    use windows::Win32::System::DataExchange::{IsClipboardFormatAvailable, RegisterClipboardFormatW};
    MARKERS.into_iter().any(|name| {
        // SAFETY: both calls only take a static, NUL-terminated name or a format id.
        let format = unsafe { RegisterClipboardFormatW(name) };
        format != 0 && unsafe { IsClipboardFormatAvailable(format) }.is_ok()
    })
}

#[cfg(not(windows))]
pub fn concealed() -> bool {
    false
}

// Bumps on every clipboard change, so an unchanged clipboard (even a 100 MB one) is never re-read.
#[cfg(windows)]
pub fn sequence() -> Option<u32> {
    // SAFETY: takes no arguments and only reads a counter.
    let n = unsafe { windows::Win32::System::DataExchange::GetClipboardSequenceNumber() };
    (n != 0).then_some(n)
}

#[cfg(not(windows))]
pub fn sequence() -> Option<u32> {
    None
}
