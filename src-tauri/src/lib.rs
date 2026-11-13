pub mod account;
pub mod activity;
pub mod alert_log;
pub mod autolock;
#[cfg(desktop)]
pub mod autostart;
pub mod background;
pub mod backup;
pub mod badge;
pub mod biometric;
pub mod blocking;
pub mod boot;
pub mod calendar;
pub mod calendar_event;
#[cfg(desktop)]
pub mod capture;
pub mod checks_cache;
pub mod clipboard;
pub mod cmd_alerts;
pub mod cmd_backup;
pub mod cmd_biometric;
pub mod cmd_extras;
pub mod cmd_gemini;
pub mod cmd_keep;
pub mod cmd_notes;
pub mod cmd_reads;
pub mod cmd_report;
pub mod cmd_sync;
pub mod commands;
pub mod contacts;
pub mod context_reminder;
pub mod crypto;
#[cfg(desktop)]
pub mod dev;
pub mod do_not_disturb;
pub mod drive;
pub mod error;
pub mod focus;
pub mod forge;
pub mod fullscreen_guard;
pub mod gemini_docs;
pub mod github;
pub mod gitlab;
#[cfg(desktop)]
pub mod global_shortcuts;
pub mod gmail;
pub mod google;
pub mod gtasks;
pub mod guest_photos;
pub mod harness;
pub mod health;
#[cfg(windows)]
pub mod hello;
#[cfg(target_os = "macos")]
pub mod hello_mac;
pub mod keep_import;
pub mod lang;
pub mod market;
pub mod meet;
pub mod meeting_alert;
pub mod meeting_cache;
pub mod mentions;
pub mod model;
pub mod models;
pub mod morning_digest;
pub mod my_pr_alerts;
pub mod my_pr_events;
pub mod net;
pub mod next_meeting;
pub mod note_images;
pub mod notification;
pub mod oauth;
pub mod own_work;
pub mod password;
pub mod paste_plain;
pub mod picked;
pub mod plain_text;
pub mod pr_state;
pub mod prefs;
pub mod priority;
pub mod reads;
pub mod report;
pub mod resilient;
pub mod review_alert;
pub mod routine;
pub mod snooze;
pub mod startup;
pub mod status;
pub mod steam;
pub mod store;
pub mod subtask;
pub mod sync;
#[cfg(desktop)]
pub mod sysmon;
pub mod task_context;
pub mod task_order;
pub mod task_reminder;
pub mod text_fold;
pub mod traffic;
pub mod transcripts;
pub mod trash;
pub mod tray;
pub mod tray_live;
pub mod unlock_log;
#[cfg(desktop)]
pub mod updater;
pub mod vault;
pub mod weather;
pub mod wifi_os;
pub mod window;
pub mod work_events;

#[cfg(desktop)]
pub use global_shortcuts::TOGGLE_SHORTCUT_LABEL;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    // Must be first: with autostart, reopening the app would create another tray and clipboard.json watcher.
    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = window::show(app);
        }))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::Builder::new().args([autostart::ARG_AUTOSTART]).build());
    #[cfg(mobile)]
    let builder = builder.plugin(tauri_plugin_fs::init());
    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(boot::setup)
        .invoke_handler(tauri::generate_handler![
            commands::vault_status,
            #[cfg(desktop)]
            capture::capture_close,
            commands::vault_create,
            commands::vault_unlock,
            commands::vault_lock,
            commands::unlock_history,
            commands::vault_touch,
            password::vault_change_password,
            commands::tasks_for_day,
            commands::task_add,
            commands::task_toggle,
            commands::task_rename,
            commands::task_complete,
            commands::task_link_pr,
            commands::tasks_carry_over,
            subtask::subtask_add,
            subtask::subtask_toggle,
            subtask::subtask_remove,
            priority::task_set_priority,
            focus::task_set_estimate,
            focus::task_add_time,
            activity::watch::activity_status,
            activity::watch::activity_set_enabled,
            activity::watch::activity_summary,
            activity::watch::activity_clear,
            task_order::tasks_reorder,
            cmd_notes::notes_search,
            cmd_notes::note_save,
            cmd_notes::note_pin,
            cmd_notes::note_export_md,
            cmd_keep::notes_import_keep,
            note_images::note_image_save,
            note_images::note_image_get,
            routine::task_set_schedule,
            routine::task_set_extended_repeat,
            task_context::task_set_context,
            task_reminder::reminder_lead_set,
            lang::language_set,
            commands::item_delete,
            drive::cmd::drive_status,
            drive::cmd::drive_configure,
            drive::cmd::drive_disconnect,
            drive::cmd::drive_connect,
            cmd_extras::clip_list,
            cmd_extras::clip_revision,
            cmd_extras::clip_copy,
            cmd_extras::clip_capture,
            cmd_extras::clip_copy_as,
            cmd_extras::clip_pin,
            cmd_extras::clip_delete,
            cmd_extras::clip_clear,
            cmd_extras::clip_set_max_pinned,
            cmd_extras::transcripts_dir,
            cmd_extras::transcripts_set_dir,
            cmd_extras::transcripts_list,
            cmd_extras::transcript_read,
            cmd_extras::agenda_today,
            cmd_gemini::gemini_docs,
            cmd_alerts::alert_open,
            cmd_alerts::alert_payload,
            cmd_alerts::alert_close,
            cmd_alerts::alert_close_all,
            cmd_alerts::alert_settle,
            cmd_alerts::alert_resize,
            alert_log::alert_log,
            fullscreen_guard::fullscreen_hold_get,
            fullscreen_guard::fullscreen_hold_set,
            cmd_alerts::main_show,
            snooze::alert_snooze,
            cmd_extras::open_link,
            #[cfg(desktop)]
            autostart::autostart_status,
            #[cfg(desktop)]
            updater::update_check,
            #[cfg(desktop)]
            updater::update_install,
            #[cfg(desktop)]
            autostart::autostart_set,
            autolock::autolock_get,
            autolock::autolock_set,
            cmd_backup::backup_export,
            cmd_backup::backup_import,
            cmd_sync::sync_get,
            cmd_sync::sync_set_folder,
            cmd_sync::sync_clear,
            cmd_sync::sync_now,
            trash::trash_undo,
            cmd_biometric::biometric_status,
            cmd_biometric::biometric_enable,
            cmd_biometric::biometric_unlock,
            cmd_biometric::biometric_disable,
            #[cfg(desktop)]
            window::state::window_config,
            #[cfg(desktop)]
            window::state::window_set_always_on_top,
            #[cfg(desktop)]
            window::state::window_reset,
            #[cfg(desktop)]
            window::mode::window_mini_set,
            #[cfg(desktop)]
            window::mode::window_mini_resize,
            github::cmd::github_status,
            github::cmd::github_save_token,
            github::cmd::github_device_start,
            github::cmd::github_device_finish,
            github::cmd::github_device_cancel,
            github::cmd::github_disconnect,
            github::cmd_lists::github_lists,
            mentions::cmd::github_mentions,
            mentions::cmd::gitlab_mentions,
            mentions::state::mention_read,
            mentions::state::mention_mute_thread,
            mentions::state::mention_mute_author,
            mentions::state::mentions_unread,
            morning_digest::morning_digest_get,
            morning_digest::morning_digest_set,
            github::cmd_lists::github_section,
            github::cmd_lists::github_pr_checks,
            github::cmd_lists::github_prs_checks,
            github::cmd_lists::github_pr_comments,
            review_alert::review_alerts_get,
            review_alert::review_alerts_set,
            my_pr_alerts::my_pr_alerts_get,
            my_pr_alerts::my_pr_alerts_set,
            gitlab::cmd::gitlab_status,
            gitlab::cmd::gitlab_connect,
            gitlab::cmd::gitlab_disconnect,
            gitlab::cmd::gitlab_lists,
            gitlab::cmd::gitlab_section,
            gitlab::cmd::gitlab_mr_checks,
            forge::cmd::forges_opened_since,
            cmd_report::forges_activity_between,
            cmd_report::report_agenda,
            cmd_report::report_vault,
            status::cmd::api_status,
            harness::cmd::harness_list,
            market::cmd::market_get,
            market::cmd::market_history,
            google::cmd::gmail_summary,
            google::cmd::gmail_modify,
            google::cmd::gtasks_list,
            google::cmd::gtasks_add,
            google::cmd::gtasks_complete,
            google::cmd::gdrive_list,
            google::cmd::gdrive_quota,
            google::cmd::contacts_list,
            prefs::prefs_get,
            prefs::prefs_set,
            gmail::alert::gmail_alerts_get,
            gmail::alert::gmail_alerts_set,
            weather::cmd::weather_get,
            weather::cmd::weather_search,
            weather::cmd::weather_set_place,
            weather::cmd::weather_clear,
            weather::alert::weather_alerts_get,
            weather::alert::weather_alerts_set,
            #[cfg(desktop)]
            dev::cmd::dev_ports_list,
            #[cfg(desktop)]
            dev::cmd::dev_port_kill,
            #[cfg(desktop)]
            dev::cmd::dev_docker_get,
            #[cfg(desktop)]
            dev::cmd::dev_docker_action,
            #[cfg(desktop)]
            dev::cmd::dev_docker_logs,
            #[cfg(desktop)]
            dev::cmd::dev_docker_prune,
            #[cfg(desktop)]
            dev::cmd::dev_git_get,
            #[cfg(desktop)]
            dev::cmd::dev_pick_folder,
            #[cfg(desktop)]
            dev::cmd::dev_git_root,
            #[cfg(desktop)]
            dev::cmd::dev_git_fetch,
            #[cfg(desktop)]
            dev::cmd::dev_git_pull,
            #[cfg(desktop)]
            dev::cmd::dev_git_terminal,
            #[cfg(desktop)]
            dev::cmd::dev_git_worktree_remove,
            #[cfg(desktop)]
            dev::cmd::dev_cron_list,
            #[cfg(desktop)]
            dev::cmd::dev_cron_change,
            #[cfg(desktop)]
            sysmon::system_get,
            #[cfg(desktop)]
            sysmon::alert::system_alerts_get,
            #[cfg(desktop)]
            sysmon::alert::system_alerts_set,
            cmd_reads::reads_get,
            cmd_reads::reads_add,
            cmd_reads::reads_remove,
            cmd_reads::reads_mark,
            cmd_reads::reads_thumb,
            cmd_reads::reads_favicon,
            health::cmd::health_list,
            health::cmd::health_save,
            health::cmd::health_remove,
            health::cmd::health_check_now,
            status::alert::status_alerts_get,
            status::alert::status_alerts_set,
            models::cmd::models_get,
            models::cmd::models_alerts_set,
            steam::cmd::steam_status,
            steam::cmd::steam_connect,
            steam::cmd::steam_disconnect,
            steam::cmd::steam_region_set,
            steam::cmd::steam_deals,
            steam::cmd::steam_trending,
            steam::cmd::steam_catalog,
            steam::cmd_more::steam_play,
            steam::cmd_more::steam_launch,
            steam::cmd_more::steam_news,
            steam::cmd_more::steam_news_read,
            steam::cmd_more::steam_top,
            steam::cmd_more::steam_wishlist,
            steam::cmd::steam_image,
            traffic::cmd::traffic_get,
            traffic::cmd::traffic_departures,
            traffic::cmd::traffic_map,
            traffic::cmd_setup::traffic_set_key,
            traffic::cmd_setup::traffic_search,
            traffic::cmd_setup::traffic_set_origin,
            traffic::cmd_setup::traffic_add_trip,
            traffic::cmd_setup::traffic_remove_trip,
            steam::alert::steam_watch_set,
            do_not_disturb::dnd_get,
            do_not_disturb::dnd_set,
            do_not_disturb::dnd_clear,
            guest_photos::guest_photos,
            contacts::photos::contact_photos,
            tray_live::badge_set_tasks,
        ])
        .on_window_event(|_win, _event| {
            #[cfg(desktop)]
            tray::on_window_event(_win, _event);
        })
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Canto");
}
