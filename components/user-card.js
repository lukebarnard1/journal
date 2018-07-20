import React from 'react';
import PropTypes from 'prop-types';
import Avatar from './avatar';
import fonts from '../style/fonts';

export default function UserCard({
    userImgUrl, userName, userTagline, timestamp,
}) {
    return (
        <div className="j-user-card">
            <Avatar src={userImgUrl} />
            <div className="details">
                <div className="name">
                    {userName}
                </div>
                <div className="tag">
                    {userTagline}
                </div>
                <div className="ts">
                    {timestamp}
                </div>
            </div>
            <div className="subscribe">
                <button type="button">
                    Subscribe
                </button>
            </div>
            <style jsx>
                {`
                .j-user-card {
                    font-family: ${fonts.ui};
                    font-size: 10pt;
                    display: flex;
                    align-items: center;

                    padding: 35px 27px;
                    border-bottom: 1px solid #ddd;
                    overflow: hidden;
                }

                .j-user-card .details {
                    margin-left: 30px;
                    color: #666;
                    line-height: 14pt;
                }

                .j-user-card .details .name {
                    font-size: 14pt;
                    padding-top: 10px;
                    line-height: 28pt;
                }
                .j-user-card .details .tag {
                    font-size: 10pt;
                }

                .j-user-card .details .ts {
                    font-size: 10pt;
                    color: #aaa;
                }

                .subscribe {
                    flex-grow: 1;
                    display: flex;
                    justify-content: flex-end;

                    margin-left: 30px;
                }

                .subscribe button {
                    border: 1px solid #ddd;
                    border-radius: 4px;

                    background-color: #fff;

                    padding: 10px;

                    cursor: pointer;
                }

                .subscribe button:active {
                    color: #fff;
                    background-color: #222;
                }
                .subscribe button:focus {
                    border: 1px solid #444;
                    outline: 0px;
                }
            `}
            </style>
        </div>
    );
}
UserCard.propTypes = {
    userImgUrl: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    userTagline: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
};
