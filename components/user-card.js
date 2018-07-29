import React from 'react';
import PropTypes from 'prop-types';

import Avatar from './avatar';
import Button from './button';
import * as mw from './ho/mediaWrapper';
import fonts from '../style/fonts';

function UserCard({
    userImgSrc, userName, userTagline, timestamp, media,
}) {
    const { isSmall } = media;
    return (
        <div className="user-card">
            <Avatar src={userImgSrc} size={isSmall ? 32 : 64} />
            <div className="details">
                <div className="name">
                    {userName}
                </div>
                { isSmall
                    ? null : (
                        <div className="tag">
                            {userTagline}
                        </div>
                    )
                }
                <div className="ts">
                    {timestamp}
                </div>
            </div>
            <div className="subscribe">
                <Button>
                    Subscribe
                </Button>
            </div>
            <style jsx>
                {`
                .user-card {
                    font-family: ${fonts.ui};
                    font-size: 10pt;
                    display: flex;
                    align-items: center;

                    padding: ${isSmall ? '10px 17px' : '35px 27px'};
                    border-bottom: 1px solid #ddd;
                    overflow: hidden;
                }

                .user-card .details {
                    margin-left: 30px;
                    color: #666;
                    line-height: 14pt;
                }

                .user-card .details .name {
                    padding-top: ${isSmall ? '0px' : '10px'};

                    font-size: ${isSmall ? '10pt' : '14pt'};
                    line-height: ${isSmall ? '14pt' : '28pt'};
                }

                .user-card .details .tag {
                    font-size: 10pt;
                }

                .user-card .details .ts {
                    font-size: 10pt;
                    color: #aaa;
                }

                .subscribe {
                    flex-grow: 1;
                    display: flex;
                    justify-content: flex-end;

                    margin-left: 30px;
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
    media: PropTypes.shape(mw.propTypes.media).isRequired,
};

export default mw.mediaWrapper(UserCard);
