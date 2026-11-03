pub mod account;
pub mod activity;
pub mod activity_os;
pub mod activity_watch;
pub mod alert_log;
pub mod autolock;
#[cfg(desktop)]
pub mod autostart;
pub mod background;
pub mod boot;
pub mod backup;
pub mod badge;
pub mod biometric;
pub mod blocking;
pub mod calendar;
pub mod calendar_event;
#[cfg(desktop)]
pub mod capture;
pub mod checks_cache;
pub mod clip_os;
pub mod clip_secret;
pub mod clip_transform;
pub mod clip_watch;
pub mod clipboard;
pub mod cmd_alerts;
pub mod cmd_backup;
pub mod cmd_biometric;
pub mod cmd_drive;
pub mod cmd_extras;
pub mod cmd_forges;
pub mod cmd_gemini;
pub mod cmd_github;
pub mod cmd_github_lists;
pub mod cmd_gitlab;
pub mod cmd_google;
pub mod cmd_harness;
pub mod cmd_health;
pub mod cmd_keep;
pub mod cmd_market;
pub mod cmd_mentions;
pub mod cmd_models;
pub mod cmd_notes;
pub mod cmd_reads;
pub mod cmd_report;
pub mod cmd_status;
pub mod cmd_steam;
pub mod cmd_steam_more;
pub mod cmd_sync;
pub mod cmd_traffic;
pub mod cmd_traffic_setup;
pub mod cmd_weather;
pub mod commands;
pub mod contact_photos;
pub mod contacts;
pub mod context_reminder;
pub mod crypto;
pub mod do_not_disturb;
pub mod drive;
pub mod drive_files;
pub mod error;
pub mod focus;
pub mod forge;
pub mod forge_cache;
pub mod forge_filter;
pub mod fullscreen_guard;
pub mod gemini_docs;
pub mod github;
pub mod github_auth;
pub mod github_checks;
pub mod github_failures;
pub mod github_query;
pub mod github_teams;
pub mod github_thread;
pub mod gitlab;
pub mod gitlab_query;
pub mod gitlab_todos;
pub mod gitlab_work;
#[cfg(desktop)]
pub mod global_shortcuts;
pub mod gmail;
pub mod gmail_actions;
pub mod gmail_alert;
pub mod google_api;
pub mod google_token;
pub mod gtasks;
pub mod guest_photos;
pub mod harness;
pub mod harness_cache;
pub mod harness_feed;
pub mod health;
pub mod health_cert;
pub mod health_probe;
pub mod health_watch;
#[cfg(windows)]
pub mod hello;
#[cfg(target_os = "macos")]
pub mod hello_mac;
pub mod keep_import;
pub mod lang;
pub mod market;
pub mod market_net;
pub mod meet;
pub mod meeting_alert;
pub mod meeting_cache;
pub mod mention_alerts;
pub mod mention_feed;
pub mod mention_sender;
pub mod mentions_state;
pub mod model;
pub mod models_alert;
pub mod models_feed;
pub mod models_fields;
pub mod models_rank;
pub mod models_state;
pub mod morning_digest;
pub mod my_pr_alerts;
pub mod my_pr_events;
pub mod net;
pub mod next_meeting;
pub mod note_images;
pub mod notification;
pub mod oauth;
pub mod own_work_alerts;
pub mod own_work_github;
pub mod own_work_gitlab;
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
pub mod status_alert;
pub mod status_cache;
pub mod status_derived;
pub mod status_feed;
pub mod status_live;
pub mod steam;
pub mod steam_alert;
pub mod steam_feed;
pub mod steam_id;
pub mod steam_lists;
pub mod steam_local;
pub mod steam_news;
pub mod steam_parse;
pub mod steam_play;
pub mod steam_player;
pub mod steam_region;
pub mod steam_review;
pub mod steam_store;
pub mod steam_top;
pub mod steam_url;
pub mod steam_watch;
pub mod steam_wish;
pub mod store;
pub mod subtask;
pub mod sync;
#[cfg(desktop)]
pub mod sysmon;
#[cfg(desktop)]
pub mod sysmon_alert;
#[cfg(desktop)]
pub mod sysmon_hints;
#[cfg(desktop)]
pub mod sysmon_probe;
#[cfg(desktop)]
pub mod sysmon_procs;
pub mod task_context;
pub mod task_order;
pub mod task_reminder;
pub mod text_fold;
pub mod traffic;
pub mod traffic_cache;
pub mod traffic_feed;
pub mod traffic_search;
pub mod traffic_tiles;
pub mod transcripts;
pub mod trash;
pub mod tray;
pub mod tray_live;
pub mod unlock_log;
#[cfg(desktop)]
pub mod updater;
pub mod vault;
pub mod weather;
pub mod weather_alert;
pub mod weather_hints;
pub mod weather_state;
pub mod wifi_os;
pub mod window;
#[cfg(desktop)]
pub mod window_mode;
#[cfg(desktop)]
pub mod window_state;
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
            activity_watch::activity_status,
            activity_watch::activity_set_enabled,
            activity_watch::activity_summary,
            activity_watch::activity_clear,
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
            cmd_drive::drive_status,
            cmd_drive::drive_configure,
            cmd_drive::drive_disconnect,
            cmd_drive::drive_connect,
            cmd_extras::clip_list,
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
            window_state::window_config,
            #[cfg(desktop)]
            window_state::window_set_always_on_top,
            #[cfg(desktop)]
            window_state::window_reset,
            #[cfg(desktop)]
            window_mode::window_mini_set,
            #[cfg(desktop)]
            window_mode::window_mini_resize,
            cmd_github::github_status,
            cmd_github::github_save_token,
            cmd_github::github_device_start,
            cmd_github::github_device_finish,
            cmd_github::github_device_cancel,
            cmd_github::github_disconnect,
            cmd_github_lists::github_lists,
            cmd_mentions::github_mentions,
            cmd_mentions::gitlab_mentions,
            mentions_state::mention_read,
            mentions_state::mention_mute_thread,
            mentions_state::mention_mute_author,
            mentions_state::mentions_unread,
            morning_digest::morning_digest_get,
            morning_digest::morning_digest_set,
            cmd_github_lists::github_section,
            cmd_github_lists::github_pr_checks,
            cmd_github_lists::github_prs_checks,
            cmd_github_lists::github_pr_comments,
            review_alert::review_alerts_get,
            review_alert::review_alerts_set,
            my_pr_alerts::my_pr_alerts_get,
            my_pr_alerts::my_pr_alerts_set,
            cmd_gitlab::gitlab_status,
            cmd_gitlab::gitlab_connect,
            cmd_gitlab::gitlab_disconnect,
            cmd_gitlab::gitlab_lists,
            cmd_gitlab::gitlab_section,
            cmd_gitlab::gitlab_mr_checks,
            cmd_forges::forges_opened_since,
            cmd_report::forges_activity_between,
            cmd_report::report_agenda,
            cmd_report::report_vault,
            cmd_status::api_status,
            cmd_harness::harness_list,
            cmd_market::market_get,
            cmd_market::market_history,
            cmd_google::gmail_summary,
            cmd_google::gmail_modify,
            cmd_google::gtasks_list,
            cmd_google::gtasks_add,
            cmd_google::gtasks_complete,
            cmd_google::gdrive_list,
            cmd_google::gdrive_quota,
            cmd_google::contacts_list,
            prefs::prefs_get,
            prefs::prefs_set,
            gmail_alert::gmail_alerts_get,
            gmail_alert::gmail_alerts_set,
            cmd_weather::weather_get,
            cmd_weather::weather_search,
            cmd_weather::weather_set_place,
            cmd_weather::weather_clear,
            weather_alert::weather_alerts_get,
            weather_alert::weather_alerts_set,
            #[cfg(desktop)]
            sysmon::system_get,
            #[cfg(desktop)]
            sysmon_alert::system_alerts_get,
            #[cfg(desktop)]
            sysmon_alert::system_alerts_set,
            cmd_reads::reads_get,
            cmd_reads::reads_add,
            cmd_reads::reads_remove,
            cmd_reads::reads_mark,
            cmd_reads::reads_thumb,
            cmd_reads::reads_favicon,
            cmd_health::health_list,
            cmd_health::health_save,
            cmd_health::health_remove,
            cmd_health::health_check_now,
            status_alert::status_alerts_get,
            status_alert::status_alerts_set,
            cmd_models::models_get,
            cmd_models::models_alerts_set,
            cmd_steam::steam_status,
            cmd_steam::steam_connect,
            cmd_steam::steam_disconnect,
            cmd_steam::steam_region_set,
            cmd_steam::steam_deals,
            cmd_steam::steam_trending,
            cmd_steam::steam_catalog,
            cmd_steam_more::steam_play,
            cmd_steam_more::steam_launch,
            cmd_steam_more::steam_news,
            cmd_steam_more::steam_news_read,
            cmd_steam_more::steam_top,
            cmd_steam_more::steam_wishlist,
            cmd_steam::steam_image,
            cmd_traffic::traffic_get,
            cmd_traffic::traffic_departures,
            cmd_traffic::traffic_map,
            cmd_traffic_setup::traffic_set_key,
            cmd_traffic_setup::traffic_search,
            cmd_traffic_setup::traffic_set_origin,
            cmd_traffic_setup::traffic_add_trip,
            cmd_traffic_setup::traffic_remove_trip,
            steam_alert::steam_watch_set,
            do_not_disturb::dnd_get,
            do_not_disturb::dnd_set,
            do_not_disturb::dnd_clear,
            guest_photos::guest_photos,
            contact_photos::contact_photos,
            tray_live::badge_set_tasks,
        ])
        .on_window_event(|_win, _event| {
            #[cfg(desktop)]
            tray::on_window_event(_win, _event);
        })
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Canto");
}
