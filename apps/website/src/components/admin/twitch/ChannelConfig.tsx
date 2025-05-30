import type { inferProcedureOutput } from "@trpc/server";
import { DateTime } from "luxon";
import { useState } from "react";

import type { AppRouter } from "@/server/trpc/router/_app";

import { formatDateTime } from "@/utils/datetime";
import { trpc } from "@/utils/trpc";

import { MessageBox } from "@/components/shared/MessageBox";
import { ModalDialog } from "@/components/shared/ModalDialog";
import {
  Button,
  LinkButton,
  dangerButtonClasses,
} from "@/components/shared/form/Button";

import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";

type ChannelConfigWithUsers = inferProcedureOutput<
  AppRouter["adminTwitch"]["getChannels"]
>[0];

function RelativeTime({ timestamp }: { timestamp: number }) {
  const date = new Date(timestamp * 1000);

  return (
    <time dateTime={date.toISOString()} title={formatDateTime(date)}>
      {DateTime.fromJSDate(date).toRelative({
        locale: "en-US",
      })}
    </time>
  );
}

function ChannelConfigRow({
  channel,
  handleConnectUserAsBroadcasterOrModerator,
  onError,
  onUpdate,
}: {
  channel: ChannelConfigWithUsers;
  handleConnectUserAsBroadcasterOrModerator: (
    channelId: string,
    role: "broadcaster" | "moderator",
  ) => void;
  onError: (error: string) => void;
  onUpdate: () => void;
}) {
  const deleteMutation = trpc.adminTwitch.deleteChannel.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });

  const moderator = channel.moderatorAccount;
  const broadcaster = channel.broadcasterAccount;
  return (
    <li
      key={channel.channelId}
      className="my-2 flex flex-col gap-2 rounded-sm border border-gray-400 bg-gray-800 p-4"
    >
      <div className="flex">
        <strong className="block flex-1 text-lg font-bold">
          {channel.label} ({channel.username} / {channel.channelId})
        </strong>
        <div className="flex flex-row-reverse gap-1">
          <LinkButton
            href={`/admin/twitch/${encodeURIComponent(channel.channelId)}/edit`}
            size="small"
            width="auto"
          >
            <IconPencil className="size-4" />
            Edit
          </LinkButton>

          <Button
            className={dangerButtonClasses}
            size="small"
            width="auto"
            confirmationMessage="Do you really want to delete the channel configuration?"
            onClick={() => deleteMutation.mutate(channel.channelId)}
          >
            <IconTrash className="size-4" />
            Delete
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2 border-t border-gray-700 py-2">
          <span className="flex-1">
            Broadcaster:{" "}
            {broadcaster ? (
              <>
                ✓ {broadcaster.user.name} - Expires{" "}
                {broadcaster.expires_at ? (
                  <RelativeTime timestamp={broadcaster.expires_at} />
                ) : (
                  ""
                )}
              </>
            ) : (
              "Not connected"
            )}
          </span>
          <Button
            size="small"
            width="auto"
            onClick={() =>
              handleConnectUserAsBroadcasterOrModerator(
                channel.channelId,
                "broadcaster",
              )
            }
          >
            {broadcaster ? "Reconnect" : "Connect"}
          </Button>
        </div>
        <div className="flex flex-row items-center gap-2 border-t border-gray-700 py-2">
          <span className="flex-1">
            Moderator:{" "}
            {moderator ? (
              <>
                ✓ {moderator.user.name} - Expires{" "}
                {moderator.expires_at ? (
                  <RelativeTime timestamp={moderator.expires_at} />
                ) : (
                  ""
                )}
              </>
            ) : (
              "Not connected"
            )}
          </span>

          <Button
            size="small"
            width="auto"
            onClick={() =>
              handleConnectUserAsBroadcasterOrModerator(
                channel.channelId,
                "moderator",
              )
            }
          >
            {moderator ? "Reconnect" : "Connect"}
          </Button>
        </div>
      </div>
    </li>
  );
}

export function ChannelConfig() {
  const utils = trpc.useContext();
  const channels = trpc.adminTwitch.getChannels.useQuery();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const connectUserAsBroadcasterOrModerator =
    trpc.adminTwitch.connectUserAsBroadcasterOrModerator.useMutation({
      onSuccess: async () => {
        await utils.adminTwitch.getChannels.invalidate();
      },
    });

  return (
    <>
      {errorMessage && (
        <ModalDialog
          title="Could not perform action"
          closeModal={() => setErrorMessage(null)}
        >
          <p>{errorMessage}</p>
        </ModalDialog>
      )}

      {connectUserAsBroadcasterOrModerator.error && (
        <MessageBox variant="failure">
          Connecting User as Channel account failed:{" "}
          {connectUserAsBroadcasterOrModerator.error.message}
        </MessageBox>
      )}

      {channels.isError && (
        <MessageBox variant="failure">Error loading channels …</MessageBox>
      )}

      {channels.isPending && <p>Loading channels …</p>}

      {channels.isSuccess &&
        (channels.data?.length ? (
          <ul className="flex flex-col">
            {channels.data?.map((channel) => (
              <ChannelConfigRow
                key={channel.channelId}
                channel={channel}
                onError={(err) => setErrorMessage(err)}
                onUpdate={() => channels.refetch()}
                handleConnectUserAsBroadcasterOrModerator={(
                  twitchChannelId,
                  role,
                ) => {
                  connectUserAsBroadcasterOrModerator.mutate({
                    twitchChannelId,
                    role,
                  });
                }}
              />
            ))}
          </ul>
        ) : (
          <p>No entries.</p>
        ))}
    </>
  );
}
