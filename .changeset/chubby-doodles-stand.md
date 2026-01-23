---
"@badrap/libapp": patch
---

Add `status` property for installations

The `status` property can have three different values: `"active"`, `"paused"` and `"uninstalled"`.

The old `removed` is now marked as deprecated and will be removed in a future release. For the time being the flag will still be kept around for now for backwards compatibility. Its value will be `true` when `status` is `"uninstalled"`, otherwise `false`.
