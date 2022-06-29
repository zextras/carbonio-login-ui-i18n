/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const renameDistributionList = async (dlId: string, newName?: string): Promise<any> => {
	const request: any = {
		RenameDistributionListReques: {
			_jsns: 'urn:zimbraAdmin',
			id: dlId,
			newName
		}
	};

	return fetch(`/service/admin/soap/RenameDistributionListReques`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: request
		})
	});
};
